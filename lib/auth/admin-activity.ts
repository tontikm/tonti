import type { NextRequest, NextResponse } from "next/server";

export const ADMIN_ACTIVITY_COOKIE = "spotra_admin_last_activity";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

export function readAdminActivityCookie(request: NextRequest): string | null {
  return request.cookies.get(ADMIN_ACTIVITY_COOKIE)?.value ?? null;
}

export function writeAdminActivityCookie(
  response: NextResponse,
  iso = new Date().toISOString(),
): void {
  response.cookies.set(ADMIN_ACTIVITY_COOKIE, iso, cookieOptions());
}

export function clearAdminActivityCookie(response: NextResponse): void {
  response.cookies.delete(ADMIN_ACTIVITY_COOKIE);
}
