import type { Event, TicketTier } from "@/lib/types";
import { getTicketsRemaining } from "@/lib/utils";

export type CartLine = {
  tierId: string;
  tierName: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type CheckoutCart = {
  lines: CartLine[];
  totalTickets: number;
  totalAmount: number;
  isFree: boolean;
};

export function parseCartFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  tiers: TicketTier[],
): CheckoutCart | null {
  const tierMap = new Map(tiers.map((tier) => [tier.id, tier]));
  const lines: CartLine[] = [];

  for (const [key, rawValue] of Object.entries(searchParams)) {
    if (key === "error") continue;
    const tier = tierMap.get(key);
    if (!tier) continue;

    const qty = Number(Array.isArray(rawValue) ? rawValue[0] : rawValue);
    if (!Number.isFinite(qty) || qty <= 0) continue;

    const remaining = getTicketsRemaining(tier);
    const quantity = Math.min(Math.floor(qty), 8, remaining);
    if (quantity <= 0) continue;

    lines.push({
      tierId: tier.id,
      tierName: tier.name,
      price: tier.price,
      quantity,
      lineTotal: tier.price * quantity,
    });
  }

  if (lines.length === 0) return null;

  const totalTickets = lines.reduce((sum, line) => sum + line.quantity, 0);
  const totalAmount = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  if (totalTickets > 10) return null;

  return {
    lines,
    totalTickets,
    totalAmount,
    isFree: totalAmount === 0,
  };
}

export function cartToSelections(cart: CheckoutCart): Record<string, number> {
  return Object.fromEntries(cart.lines.map((line) => [line.tierId, line.quantity]));
}

export function buildCheckoutUrl(eventSlug: string, quantities: Record<string, number>): string {
  const params = new URLSearchParams();
  for (const [tierId, qty] of Object.entries(quantities)) {
    if (qty > 0) params.set(tierId, String(qty));
  }
  const query = params.toString();
  return query
    ? `/events/${eventSlug}/checkout?${query}`
    : `/events/${eventSlug}/checkout`;
}
