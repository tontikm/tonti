const SA_TIME_ZONE = "Africa/Johannesburg";

export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `R${formatted}`;
}

export function formatEventDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: SA_TIME_ZONE,
  }).format(new Date(isoDate));
}

export function formatEventTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: SA_TIME_ZONE,
  }).format(new Date(isoDate));
}

export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    timeZone: SA_TIME_ZONE,
  }).format(new Date(isoDate));
}

export function formatDateRange(startIso: string, endIso?: string): string {
  if (!endIso) return formatEventDate(startIso);
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) return formatEventDate(startIso);
  return `${formatShortDate(startIso)} – ${formatEventDate(endIso)}`;
}

export type EventStatus = "upcoming" | "today" | "ended";

/** Start of the current calendar day in SAST, as a Date. */
function startOfTodaySast(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${parts}T00:00:00+02:00`);
}

/**
 * An event is "past" once its end (or show) moment falls before the start of
 * today (SAST). Events happening today remain visible.
 */
export function isPastEvent(event: {
  showTime: string;
  endDate?: string;
  date?: string;
}): boolean {
  const reference = event.endDate ?? event.showTime ?? event.date;
  if (!reference) return false;
  return new Date(reference).getTime() < startOfTodaySast().getTime();
}

export function getEventStatus(event: {
  showTime: string;
  endDate?: string;
  date?: string;
}): EventStatus {
  if (isPastEvent(event)) return "ended";

  const start = startOfTodaySast();
  const tomorrow = new Date(start);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const showAt = new Date(event.showTime ?? event.date ?? "").getTime();
  if (showAt >= start.getTime() && showAt < tomorrow.getTime()) {
    return "today";
  }
  return "upcoming";
}

export function getTicketsRemaining(tier: {
  capacity: number;
  sold: number;
}): number {
  return Math.max(0, tier.capacity - tier.sold);
}

const LOW_STOCK_RATIO = 0.15;

export type AvailabilityStatus = "available" | "limited" | "sold-out";

/** Fan-facing availability for a single tier (no counts). */
export function getTierAvailability(tier: {
  capacity: number;
  sold: number;
}): AvailabilityStatus {
  const remaining = getTicketsRemaining(tier);
  if (remaining === 0) return "sold-out";
  if (tier.capacity > 0 && remaining / tier.capacity < LOW_STOCK_RATIO) {
    return "limited";
  }
  return "available";
}

/** Fan-facing availability across all tiers (no counts). */
export function getEventAvailability(
  tiers: { capacity: number; sold: number }[],
): AvailabilityStatus {
  if (tiers.length === 0) return "available";
  if (tiers.every((tier) => getTierAvailability(tier) === "sold-out")) {
    return "sold-out";
  }
  if (tiers.some((tier) => getTierAvailability(tier) === "limited")) {
    return "limited";
  }
  return "available";
}

export function availabilityLabel(status: AvailabilityStatus): string {
  switch (status) {
    case "sold-out":
      return "Sold out";
    case "limited":
      return "Almost gone";
    case "available":
      return "Available";
  }
}

export function getLowestPrice(
  tiers: { price: number }[],
): number | null {
  if (tiers.length === 0) return null;
  return Math.min(...tiers.map((t) => t.price));
}

export type SocialProof = {
  going: number;
  label: "Selling fast" | "Trending" | null;
};

/** Derives lightweight social-proof signals from a tier's sold/capacity data. */
export function getSocialProof(
  tiers: { capacity: number; sold: number }[],
): SocialProof {
  const going = tiers.reduce((sum, tier) => sum + Math.max(0, tier.sold), 0);
  const capacity = tiers.reduce((sum, tier) => sum + tier.capacity, 0);
  const ratio = capacity > 0 ? going / capacity : 0;

  let label: SocialProof["label"] = null;
  if (ratio >= 0.7) label = "Selling fast";
  else if (going >= 100) label = "Trending";

  return { going, label };
}

/** Formats min/max age for badges and copy. Returns null when no restriction. */
export function formatAgeRange(
  min?: number | null,
  max?: number | null,
): string | null {
  if (min == null && max == null) return null;
  if (min != null) return `${min}+`;
  return `Up to ${max}`;
}

export function isAdultsOnlyAge(min?: number | null, max?: number | null): boolean {
  return min != null && min >= 18;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Parse datetime-local value as SAST (+02:00). */
export function sastToIso(dateTimeLocal: string): string {
  return new Date(`${dateTimeLocal}:00+02:00`).toISOString();
}

/** Split ISO timestamp into date (YYYY-MM-DD) and time (HH:mm) in SAST. */
export function isoToSastDateAndTime(iso: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

export function combineSastDateAndTime(date: string, time: string): string {
  return `${date}T${time}`;
}

/** Format ISO timestamp for datetime-local inputs in SAST. */
export function isoToSastDatetimeLocal(iso: string): string {
  const { date, time } = isoToSastDateAndTime(iso);
  return `${date}T${time}`;
}
