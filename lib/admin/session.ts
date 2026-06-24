import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin/constants";
import { ADMIN_ACTIVITY_COOKIE } from "@/lib/auth/admin-activity";
import {
  getLastActivityAt,
  IDLE_TIMEOUTS_MS,
  isIdleExpired,
} from "@/lib/auth/idle-timeout";

export { ADMIN_SESSION_COOKIE_NAME };

export type AdminSession = {
  id: string;
  email: string;
  name?: string;
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

function activityCookieOptions() {
  return sessionCookieOptions();
}

function getSessionSecret(): string | null {
  if (process.env.ADMIN_SESSION_SECRET) {
    return process.env.ADMIN_SESSION_SECRET;
  }
  if (process.env.NODE_ENV === "development") {
    return "spotra-dev-admin-session";
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

function encodeSignedSession(session: AdminSession, secret: string): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = signPayload(payload, secret);
  return `${payload}.${signature}`;
}

function decodeSignedSession(raw: string, secret: string): AdminSession | null {
  const dot = raw.indexOf(".");
  if (dot === -1) return null;

  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  if (!payload || !signature) return null;
  if (!verifySignature(payload, signature, secret)) return null;

  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const secret = getSessionSecret();
  if (!secret) return null;

  const decoded = decodeURIComponent(raw);
  const session = decodeSignedSession(decoded, secret);
  if (!session) return null;

  const activityCookie = cookieStore.get(ADMIN_ACTIVITY_COOKIE)?.value;
  const lastActivity = activityCookie ?? getLastActivityAt(session);
  if (isIdleExpired(lastActivity, IDLE_TIMEOUTS_MS.admin)) {
    return null;
  }

  return session;
}

export async function setAdminSession(session: AdminSession): Promise<void> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is required to sign admin sessions in production.",
    );
  }

  const now = new Date().toISOString();
  const payload: AdminSession = {
    ...session,
    loggedInAt: session.loggedInAt ?? now,
    lastActivityAt: session.lastActivityAt ?? session.loggedInAt ?? now,
  };

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, encodeURIComponent(encodeSignedSession(payload, secret)), sessionCookieOptions());
  cookieStore.set(ADMIN_ACTIVITY_COOKIE, now, activityCookieOptions());
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
  cookieStore.delete(ADMIN_ACTIVITY_COOKIE);
}
