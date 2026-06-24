import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ORGANIZER_ACTIVITY_COOKIE } from "@/lib/auth/organizer-activity";
import {
  getLastActivityAt,
  IDLE_TIMEOUTS_MS,
  isIdleExpired,
} from "@/lib/auth/idle-timeout";

export const ORGANIZER_SESSION_COOKIE_NAME = "spotra_organizer_session";

export type OrganizerSession = {
  id?: string;
  email: string;
  name?: string;
  slug?: string;
  loggedInAt: string;
  lastActivityAt?: string;
};

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

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

export async function getOrganizerSession(): Promise<OrganizerSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ORGANIZER_SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const secret = getSessionSecret();
  if (!secret) return null;

  const decoded = decodeURIComponent(raw);
  const session = decodeSignedSession(decoded, secret);
  if (!session) return null;

  const activityCookie = cookieStore.get(ORGANIZER_ACTIVITY_COOKIE)?.value;
  const lastActivity = activityCookie ?? getLastActivityAt(session);
  if (isIdleExpired(lastActivity, IDLE_TIMEOUTS_MS.organizer)) {
    return null;
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
  cookieStore.set(
    ORGANIZER_SESSION_COOKIE_NAME,
    encodeURIComponent(encodeSignedSession(payload, secret)),
    sessionCookieOptions(),
  );
  cookieStore.set(ORGANIZER_ACTIVITY_COOKIE, now, sessionCookieOptions());
}

export async function clearOrganizerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ORGANIZER_SESSION_COOKIE_NAME);
  cookieStore.delete(ORGANIZER_ACTIVITY_COOKIE);
}
