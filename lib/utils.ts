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
