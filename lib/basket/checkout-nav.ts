import { buildCheckoutUrl } from "@/lib/checkout";
import {
  getBasketSecondsRemaining,
  isBasketExpired,
  isBasketValidForEvent,
} from "@/lib/basket/timer";
import type { BasketSnapshot } from "@/lib/basket/storage";

export const BASKET_EXPIRED_MESSAGE =
  "Your basket expired. Select tickets again.";

export function getCheckoutUrlIfValid(
  basket: BasketSnapshot | null,
  eventSlug: string,
  quantities: Record<string, number>,
): string | null {
  if (!isBasketValidForEvent(basket, eventSlug)) return null;
  if (!basket || isBasketExpired(basket)) return null;
  if (getBasketSecondsRemaining(basket) <= 0) return null;
  return buildCheckoutUrl(eventSlug, quantities);
}
