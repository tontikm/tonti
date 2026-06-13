export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents);
}

export function formatEventDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function formatEventTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

export function getTicketsRemaining(tier: {
  capacity: number;
  sold: number;
}): number {
  return Math.max(0, tier.capacity - tier.sold);
}

export function getLowestPrice(
  tiers: { price: number }[],
): number | null {
  if (tiers.length === 0) return null;
  return Math.min(...tiers.map((t) => t.price));
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
