import { randomBytes } from "crypto";
import type {
  EventTicket,
  EventTicketSummary,
  EventTicketWithBuyer,
  TicketOrder,
} from "@/lib/types";
import { getSupabaseServer } from "@/lib/supabase/server";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function generateTicketCode(): string {
  const segment = () => randomBytes(3).toString("hex").toUpperCase();
  return `TNTI-${segment()}-${segment()}`;
}

export function getTicketVerifyUrl(code: string): string {
  return `${getSiteUrl()}/tickets/verify/${code}`;
}

function mapOrderRow(row: Record<string, unknown>): TicketOrder {
  return {
    id: row.id as string,
    eventSlug: row.event_slug as string,
    buyerName: row.buyer_name as string,
    buyerEmail: row.buyer_email as string,
    totalAmount: Number(row.total_amount ?? 0),
    ticketCount: Number(row.ticket_count ?? 0),
    status: row.status as string,
    createdAt: row.created_at as string,
    userId: (row.user_id as string) ?? undefined,
    buyerPhone: (row.buyer_phone as string) ?? undefined,
  };
}

function mapTicketRow(row: Record<string, unknown>): EventTicket {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    eventSlug: row.event_slug as string,
    tierId: row.tier_id as string,
    tierName: row.tier_name as string,
    code: row.code as string,
    holderName: row.holder_name as string,
    status: row.status as string,
    checkedInAt: (row.checked_in_at as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export async function getOrderById(
  orderId: string,
): Promise<TicketOrder | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  return data ? mapOrderRow(data) : null;
}

export async function getTicketsByOrderId(
  orderId: string,
): Promise<EventTicket[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return (data ?? []).map(mapTicketRow);
}

export async function getTicketByCode(
  code: string,
): Promise<(EventTicket & { order: TicketOrder }) | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data: ticket } = await supabase
    .from("tickets")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (!ticket) return null;

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", ticket.order_id)
    .maybeSingle();

  if (!order) return null;

  return {
    ...mapTicketRow(ticket),
    order: mapOrderRow(order),
  };
}

export async function getEventTickets(
  eventSlug: string,
): Promise<EventTicketWithBuyer[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  const { data: ticketRows } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_slug", eventSlug)
    .order("created_at", { ascending: false });

  if (!ticketRows?.length) return [];

  const orderIds = [...new Set(ticketRows.map((row) => row.order_id as string))];
  const { data: orderRows } = await supabase
    .from("orders")
    .select("id, buyer_name, buyer_email")
    .in("id", orderIds);

  const orderMap = new Map(
    (orderRows ?? []).map((row) => [
      row.id as string,
      {
        buyerName: row.buyer_name as string,
        buyerEmail: row.buyer_email as string,
      },
    ]),
  );

  return ticketRows.map((row) => {
    const order = orderMap.get(row.order_id as string);
    return {
      ...mapTicketRow(row as Record<string, unknown>),
      buyerName: order?.buyerName ?? "",
      buyerEmail: order?.buyerEmail ?? "",
    };
  });
}

export async function getEventTicketSummary(
  eventSlug: string,
): Promise<EventTicketSummary> {
  const tickets = await getEventTickets(eventSlug);
  const orderIds = new Set(tickets.map((ticket) => ticket.orderId));
  const tierMap = new Map<
    string,
    { tierId: string; tierName: string; total: number; checkedIn: number }
  >();

  for (const ticket of tickets) {
    const existing = tierMap.get(ticket.tierId) ?? {
      tierId: ticket.tierId,
      tierName: ticket.tierName,
      total: 0,
      checkedIn: 0,
    };
    existing.total += 1;
    if (ticket.status === "used") existing.checkedIn += 1;
    tierMap.set(ticket.tierId, existing);
  }

  return {
    totalTickets: tickets.length,
    checkedIn: tickets.filter((ticket) => ticket.status === "used").length,
    valid: tickets.filter((ticket) => ticket.status === "valid").length,
    orderCount: orderIds.size,
    byTier: Array.from(tierMap.values()),
  };
}

export function parseTicketCodeFromScan(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const segment = url.pathname.split("/").filter(Boolean).pop();
    return (segment ?? trimmed).toUpperCase();
  } catch {
    return trimmed.toUpperCase();
  }
}
