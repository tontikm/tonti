import type { TicketTier } from "@/lib/types";
import {
  buildCartFromQuantities,
  type CheckoutCart,
} from "@/lib/checkout";
import {
  getBasketExpiresAt,
  getBasketSecondsRemaining,
  isBasketExpired,
} from "@/lib/basket/timer";

export const BASKET_STORAGE_KEY = "spotra:basket";
export const BASKET_CHANGED_EVENT = "spotra:basket-changed";

export type BasketSnapshot = {
  eventSlug: string;
  eventTitle: string;
  eventImage?: string;
  quantities: Record<string, number>;
  updatedAt: string;
  expiresAt: string;
};

export type BasketEventMeta = {
  slug: string;
  title: string;
  image?: string;
};

function notifyBasketChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BASKET_CHANGED_EVENT));
}

function sanitizeQuantities(
  quantities: Record<string, number>,
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [tierId, raw] of Object.entries(quantities)) {
    const qty = Math.floor(Number(raw));
    if (qty > 0) next[tierId] = qty;
  }
  return next;
}

function normalizeSnapshot(parsed: BasketSnapshot): BasketSnapshot | null {
  if (!parsed?.eventSlug || typeof parsed.quantities !== "object") return null;
  const quantities = sanitizeQuantities(parsed.quantities);
  if (Object.keys(quantities).length === 0) return null;
  if (!parsed.expiresAt) return null;
  return {
    eventSlug: parsed.eventSlug,
    eventTitle: parsed.eventTitle,
    eventImage: parsed.eventImage,
    quantities,
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    expiresAt: parsed.expiresAt,
  };
}

export function readBasket(): BasketSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BASKET_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BasketSnapshot;
    const snapshot = normalizeSnapshot(parsed);
    if (!snapshot) {
      clearBasket();
      return null;
    }
    if (isBasketExpired(snapshot)) {
      clearBasket();
      return null;
    }
    return snapshot;
  } catch {
    return null;
  }
}

export function writeBasket(snapshot: Omit<BasketSnapshot, "expiresAt" | "updatedAt"> & Partial<Pick<BasketSnapshot, "expiresAt" | "updatedAt">>): void {
  if (typeof window === "undefined") return;
  const quantities = sanitizeQuantities(snapshot.quantities);
  if (Object.keys(quantities).length === 0) {
    clearBasket();
    return;
  }
  try {
    window.localStorage.setItem(
      BASKET_STORAGE_KEY,
      JSON.stringify({
        eventSlug: snapshot.eventSlug,
        eventTitle: snapshot.eventTitle,
        eventImage: snapshot.eventImage,
        quantities,
        updatedAt: new Date().toISOString(),
        expiresAt: getBasketExpiresAt(),
      }),
    );
    notifyBasketChanged();
  } catch {
    // Ignore storage failures.
  }
}

export function clearBasket(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BASKET_STORAGE_KEY);
    notifyBasketChanged();
  } catch {
    // Ignore storage failures.
  }
}

export function getBasketTicketCount(snapshot: BasketSnapshot | null): number {
  if (!snapshot) return 0;
  return Object.values(snapshot.quantities).reduce((sum, qty) => sum + qty, 0);
}

export { getBasketSecondsRemaining, isBasketExpired };

export function buildCheckoutCartFromBasket(
  basket: BasketSnapshot,
  tiers: TicketTier[],
): CheckoutCart | null {
  return buildCartFromQuantities(basket.quantities, tiers);
}

export function clampBasketToTiers(
  basket: BasketSnapshot,
  tiers: TicketTier[],
): { basket: BasketSnapshot; cart: CheckoutCart | null; changed: boolean } {
  const cart = buildCartFromQuantities(basket.quantities, tiers);
  if (!cart) {
    return { basket, cart: null, changed: false };
  }

  const nextQuantities = Object.fromEntries(
    cart.lines.map((line) => [line.tierId, line.quantity]),
  );
  const changed =
    Object.keys(basket.quantities).length !== Object.keys(nextQuantities).length ||
    Object.entries(basket.quantities).some(
      ([tierId, qty]) => (nextQuantities[tierId] ?? 0) !== qty,
    );

  if (!changed) {
    return { basket, cart, changed: false };
  }

  const nextBasket: BasketSnapshot = {
    ...basket,
    quantities: nextQuantities,
    updatedAt: new Date().toISOString(),
    expiresAt: getBasketExpiresAt(),
  };
  return { basket: nextBasket, cart, changed: true };
}
