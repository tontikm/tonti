import type { Event, EventTicket, TicketOrder } from "@/lib/types";
import type { FanUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAllEvents } from "@/lib/data/events";

export type FanOrderRecord = {
  order: TicketOrder;
  event: Event | null;
  tickets: EventTicket[];
};

function mapOrderRow(row: Record<string, unknown>): TicketOrder {
  const totalAmount = Number(row.total_amount ?? 0);
  const subtotalAmount = Number(row.subtotal_amount ?? totalAmount);
  return {
    id: row.id as string,
    eventSlug: row.event_slug as string,
    buyerName: row.buyer_name as string,
    buyerEmail: row.buyer_email as string,
    subtotalAmount,
    serviceFee: Number(row.service_fee ?? 0),
    totalAmount,
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

export function canUserAccessOrder(
  user: FanUser,
  order: Pick<TicketOrder, "userId" | "buyerEmail">,
): boolean {
  if (order.userId && order.userId === user.id) return true;
  return order.buyerEmail.toLowerCase() === user.email.toLowerCase();
}

export async function getFanOrders(user: FanUser): Promise<FanOrderRecord[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const email = user.email.toLowerCase();

  const { data: orderRows, error } = await supabase
    .from("orders")
    .select("*")
    .or(`user_id.eq.${user.id},buyer_email.eq.${email}`)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });

  if (error || !orderRows?.length) return [];

  const orderIds = orderRows.map((row) => row.id as string);

  const { data: ticketRows } = await supabase
    .from("tickets")
    .select("*")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

  const ticketsByOrder = new Map<string, EventTicket[]>();
  for (const row of ticketRows ?? []) {
    const ticket = mapTicketRow(row as Record<string, unknown>);
    const list = ticketsByOrder.get(ticket.orderId) ?? [];
    list.push(ticket);
    ticketsByOrder.set(ticket.orderId, list);
  }

  const events = await getAllEvents();
  const eventBySlug = new Map(events.map((event) => [event.slug, event]));

  return orderRows.map((row) => {
    const order = mapOrderRow(row as Record<string, unknown>);
    return {
      order,
      event: eventBySlug.get(order.eventSlug) ?? null,
      tickets: ticketsByOrder.get(order.id) ?? [],
    };
  });
}

export function isOrderUpcoming(record: FanOrderRecord, now = new Date()): boolean {
  if (!record.event) return false;
  const hasValidTicket = record.tickets.some((ticket) => ticket.status === "valid");
  if (!hasValidTicket) return false;
  const eventDate = new Date(record.event.showTime);
  return eventDate >= now;
}

export function isOrderAttended(record: FanOrderRecord): boolean {
  return record.tickets.some(
    (ticket) => ticket.status === "used" || Boolean(ticket.checkedInAt),
  );
}

export function isOrderPast(record: FanOrderRecord, now = new Date()): boolean {
  if (!record.event) return isOrderAttended(record);
  const eventDate = new Date(record.event.showTime);
  return eventDate < now || isOrderAttended(record);
}
