import type { Event, EventTicket, TicketOrder } from "@/lib/types";
import { formatEventDate, formatEventTime } from "@/lib/utils";
import { getSiteUrl } from "@/lib/tickets";

export function normalizeWhatsAppPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;

  let normalized = digits;
  if (normalized.startsWith("0") && normalized.length === 10) {
    normalized = `27${normalized.slice(1)}`;
  } else if (normalized.length === 9 && !normalized.startsWith("27")) {
    normalized = `27${normalized}`;
  }

  if (normalized.length < 11 || normalized.length > 15) {
    return null;
  }

  return normalized;
}

type BuildMessageInput = {
  event: Pick<Event, "title" | "date" | "doorsTime" | "venue">;
  order: Pick<TicketOrder, "id" | "totalAmount" | "ticketCount">;
  tickets: Pick<EventTicket, "code" | "tierName">[];
  orderUrl: string;
};

export function buildTicketWhatsAppMessage({
  event,
  order,
  tickets,
  orderUrl,
}: BuildMessageInput): string {
  const lines = [
    `Your tickets for ${event.title}`,
    "",
    `${formatEventDate(event.date)} · Doors ${formatEventTime(event.doorsTime)}`,
    `${event.venue.name}, ${event.venue.city}`,
    "",
    `View QR codes: ${orderUrl}`,
    "",
    `${order.ticketCount} ticket${order.ticketCount !== 1 ? "s" : ""}:`,
    ...tickets.map((ticket) => `• ${ticket.code} (${ticket.tierName})`),
    "",
    "Show each QR code at the door.",
  ];

  return lines.join("\n");
}

export function getWhatsAppSendUrl(
  phone: string | null | undefined,
  message: string,
): string {
  const encoded = encodeURIComponent(message);
  const normalized = phone ? normalizeWhatsAppPhone(phone) : null;
  if (normalized) {
    return `https://wa.me/${normalized}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

export function getTicketOrderUrl(orderId: string): string {
  return `${getSiteUrl()}/tickets/${orderId}`;
}
