export const IDLE_TIMEOUTS_MS = {
  admin: 20 * 60 * 1000,
  organizer: 60 * 60 * 1000,
  fan: 2 * 60 * 60 * 1000,
} as const;

export const ACTIVITY_TOUCH_INTERVAL_MS = 60 * 1000;

export type ActivitySession = {
  lastActivityAt?: string;
  loggedInAt: string;
};

export function getLastActivityAt(session: ActivitySession): string {
  return session.lastActivityAt ?? session.loggedInAt;
}

export function isIdleExpired(
  lastActivityAt: string,
  idleMs: number,
  now = Date.now(),
): boolean {
  return now - new Date(lastActivityAt).getTime() >= idleMs;
}

export function shouldTouchActivity(
  lastActivityAt: string,
  now = Date.now(),
): boolean {
  return now - new Date(lastActivityAt).getTime() >= ACTIVITY_TOUCH_INTERVAL_MS;
}
