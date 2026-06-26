import type { Event } from "@/lib/types";
import { BRAND_NAME } from "@/lib/site";
import {
  formatAgeRange,
  formatDateRange,
  formatEventDate,
  formatPrice,
  getLowestPrice,
} from "@/lib/utils";

type EventShareInput = Pick<
  Event,
  "title" | "date" | "endDate" | "venue" | "tiers" | "ageLimit" | "ageMax"
>;

export function buildEventWhatsAppShareMessage(
  event: EventShareInput,
  eventUrl: string,
): string {
  const dateLine = event.endDate
    ? formatDateRange(event.date, event.endDate)
    : formatEventDate(event.date);

  const lowest = getLowestPrice(event.tiers);
  const priceLine =
    lowest == null
      ? null
      : lowest === 0
        ? "Free entry"
        : `From ${formatPrice(lowest)}`;

  const ageLine = formatAgeRange(event.ageLimit, event.ageMax);
  const detailLine = [priceLine, ageLine].filter(Boolean).join(" · ");

  const lines = [
    event.title,
    "",
    dateLine,
    `${event.venue.name}, ${event.venue.city}`,
  ];

  if (detailLine) {
    lines.push(detailLine);
  }

  lines.push("", `Get tickets on ${BRAND_NAME}:`, eventUrl);

  return lines.join("\n");
}

export function toAbsoluteShareImageUrl(
  origin: string,
  imageUrl: string,
): string {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${origin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}
