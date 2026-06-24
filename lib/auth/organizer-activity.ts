import type { NextRequest, NextResponse } from "next/server";

export const ORGANIZER_ACTIVITY_COOKIE = "spotra_organizer_last_activity";

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

export function readOrganizerActivityCookie(request: NextRequest): string | null {
  return request.cookies.get(ORGANIZER_ACTIVITY_COOKIE)?.value ?? null;
}

export function writeOrganizerActivityCookie(
  response: NextResponse,
  iso = new Date().toISOString(),
): void {
  response.cookies.set(ORGANIZER_ACTIVITY_COOKIE, iso, cookieOptions());
}

export function clearOrganizerActivityCookie(response: NextResponse): void {
  response.cookies.delete(ORGANIZER_ACTIVITY_COOKIE);
}
