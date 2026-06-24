import type { BasketSnapshot } from "@/lib/basket/storage";

export const BASKET_TTL_MS = 15 * 60 * 1000;

export function getBasketExpiresAt(fromMs = Date.now()): string {
  return new Date(fromMs + BASKET_TTL_MS).toISOString();
}

export function isBasketExpired(snapshot: BasketSnapshot): boolean {
  if (!snapshot.expiresAt) return true;
  return Date.now() >= new Date(snapshot.expiresAt).getTime();
}

export function getBasketSecondsRemaining(snapshot: BasketSnapshot): number {
  if (!snapshot.expiresAt) return 0;
  const remainingMs = new Date(snapshot.expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(remainingMs / 1000));
}

export function formatBasketCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function isBasketValidForEvent(
  snapshot: BasketSnapshot | null,
  eventSlug: string,
): boolean {
  if (!snapshot || snapshot.eventSlug !== eventSlug) return false;
  return !isBasketExpired(snapshot);
}
