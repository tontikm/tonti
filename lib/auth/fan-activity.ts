import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export const FAN_ACTIVITY_COOKIE = "spotra_fan_last_activity";

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

export function readFanActivityCookie(request: NextRequest): string | null {
  return request.cookies.get(FAN_ACTIVITY_COOKIE)?.value ?? null;
}

export function writeFanActivityCookie(
  response: NextResponse,
  iso = new Date().toISOString(),
): void {
  response.cookies.set(FAN_ACTIVITY_COOKIE, iso, cookieOptions());
}

export function clearFanActivityCookie(response: NextResponse): void {
  response.cookies.delete(FAN_ACTIVITY_COOKIE);
}

export async function getFanLastActivity(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(FAN_ACTIVITY_COOKIE)?.value ?? null;
}

export async function setFanLastActivity(iso = new Date().toISOString()): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(FAN_ACTIVITY_COOKIE, iso, cookieOptions());
}

export async function clearFanLastActivity(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(FAN_ACTIVITY_COOKIE);
}
