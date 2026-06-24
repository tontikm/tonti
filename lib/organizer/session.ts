import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  getLastActivityAt,
  IDLE_TIMEOUTS_MS,
  isIdleExpired,
  shouldTouchActivity,
} from "@/lib/auth/idle-timeout";

const COOKIE_NAME = "spotra_organizer_session";

export type OrganizerSession = {
  id?: string;
  email: string;
  name?: string;
  slug?: string;
  loggedInAt: string;
  lastActivityAt?: string;
};

type GetOrganizerSessionOptions = {
  touch?: boolean;
};

function getSessionSecret(): string | null {
  if (process.env.ORGANIZER_SESSION_SECRET) {
    return process.env.ORGANIZER_SESSION_SECRET;
  }
  if (process.env.NODE_ENV === "development") {
    return "spotra-dev-organizer-session";
  }
  return null;
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = signPayload(payload, secret);
  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function encodeSignedSession(session: OrganizerSession, secret: string): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = signPayload(payload, secret);
  return `${payload}.${signature}`;
}

function decodeSignedSession(raw: string, secret: string): OrganizerSession | null {
  const dot = raw.indexOf(".");
  if (dot === -1) return null;

  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  if (!payload || !signature) return null;
  if (!verifySignature(payload, signature, secret)) return null;

  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as OrganizerSession;
  } catch {
    return null;
  }
}

export async function getOrganizerSession(
  options: GetOrganizerSessionOptions = {},
): Promise<OrganizerSession | null> {
  const { touch = true } = options;
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const secret = getSessionSecret();
  if (!secret) return null;

  const decoded = decodeURIComponent(raw);
  const session = decodeSignedSession(decoded, secret);
  if (!session) return null;

  const lastActivity = getLastActivityAt(session);
  if (isIdleExpired(lastActivity, IDLE_TIMEOUTS_MS.organizer)) {
    await clearOrganizerSession();
    return null;
  }

  if (touch && shouldTouchActivity(lastActivity)) {
    const updated: OrganizerSession = {
      ...session,
      lastActivityAt: new Date().toISOString(),
    };
    await setOrganizerSession(updated);
    return updated;
  }

  return session;
}

export async function setOrganizerSession(session: OrganizerSession): Promise<void> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error(
      "ORGANIZER_SESSION_SECRET is required to sign organizer sessions in production.",
    );
  }

  const now = new Date().toISOString();
  const payload: OrganizerSession = {
    ...session,
    loggedInAt: session.loggedInAt ?? now,
    lastActivityAt: session.lastActivityAt ?? session.loggedInAt ?? now,
  };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeURIComponent(encodeSignedSession(payload, secret)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearOrganizerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
