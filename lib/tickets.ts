import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EventSalesReport,
  EventTicket,
  EventTicketSummary,
  EventTicketWithBuyer,
  TicketOrder,
  TicketTier,
} from "@/lib/types";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { revenueFromDbRow } from "@/lib/payments/order-revenue";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function generateTicketCode(): string {
  return `TNTI-${randomBytes(8).toString("hex").toUpperCase()}`;
}

export function getTicketVerifyUrl(code: string): string {
  return `${getSiteUrl()}/tickets/verify/${code}`;
}

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
    paymentProvider: (row.payment_provider as string) ?? undefined,
    paymentReference: (row.payment_reference as string) ?? undefined,
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

export type EventTicketWithSecret = EventTicket & {
  totpSecret: string;
};

function mapTicketRowWithSecret(
  row: Record<string, unknown>,
): EventTicketWithSecret {
  return {
    ...mapTicketRow(row),
    totpSecret: (row.totp_secret as string) ?? "",
  };
}

export async function getTicketsByOrderIdForOwner(
  orderId: string,
): Promise<EventTicketWithSecret[]> {
  const supabase = getSupabaseAdmin() ?? getSupabaseServer();
  if (!supabase) return [];

  await ensureTicketTotpSecretsForOrder(supabase, orderId);

  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return (data ?? []).map(mapTicketRowWithSecret);
}

async function ensureTicketTotpSecretsForOrder(
  supabase: SupabaseClient,
  orderId: string,
): Promise<void> {
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, totp_secret")
    .eq("order_id", orderId);

  if (!tickets?.length) return;

  for (const row of tickets) {
    const secret = row.totp_secret as string | null;
    if (secret?.trim()) continue;

    await supabase
      .from("tickets")
      .update({ totp_secret: randomBytes(20).toString("base64") })
      .eq("id", row.id as string);
  }
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

export type OrganizerEventStat = {
  ticketsIssued: number;
  revenue: number;
};

/**
 * Batched ticket counts + gross revenue for many events at once, keyed by
 * event slug. Used by the organizer events list. Returns an empty map when
 * Supabase is not configured.
 */
export async function getOrganizerEventStats(
  slugs: string[],
): Promise<Map<string, OrganizerEventStat>> {
  const stats = new Map<string, OrganizerEventStat>();
  for (const slug of slugs) {
    stats.set(slug, { ticketsIssued: 0, revenue: 0 });
  }

  const supabase = getSupabaseServer();
  if (!supabase || slugs.length === 0) return stats;

  const [{ data: ticketRows }, { data: orderRows }] = await Promise.all([
    supabase.from("tickets").select("event_slug").in("event_slug", slugs),
    supabase
      .from("orders")
      .select("event_slug, subtotal_amount, total_amount, status")
      .in("event_slug", slugs)
      .eq("status", "confirmed"),
  ]);

  for (const row of ticketRows ?? []) {
    const slug = row.event_slug as string;
    const stat = stats.get(slug);
    if (stat) stat.ticketsIssued += 1;
  }

  for (const row of orderRows ?? []) {
    const slug = row.event_slug as string;
    const stat = stats.get(slug);
    if (!stat) continue;
    const { collected } = revenueFromDbRow(row);
    stat.revenue += collected;
  }

  for (const stat of stats.values()) {
    stat.revenue = Math.round(stat.revenue * 100) / 100;
  }

  return stats;
}

/**
 * Builds a full sales/attendance report for an event. Revenue is summed from
 * confirmed orders; per-tier revenue is derived from tier price * sold.
 */
export async function getEventSalesReport(
  eventSlug: string,
  tiers: TicketTier[],
): Promise<EventSalesReport> {
  const supabase = getSupabaseServer();

  const tickets = await getEventTickets(eventSlug);

  let grossRevenue = 0;
  let serviceFee = 0;
  let orderCount = 0;
  const zeroTotalOrderIds = new Set<string>();

  if (supabase) {
    const { data: orderRows } = await supabase
      .from("orders")
      .select("id, status, subtotal_amount, service_fee, total_amount")
      .eq("event_slug", eventSlug)
      .eq("status", "confirmed");

    for (const row of orderRows ?? []) {
      orderCount += 1;
      const { collected, serviceFee: fee } = revenueFromDbRow(row);
      grossRevenue += collected;
      serviceFee += fee;
      if (Number(row.total_amount ?? collected) <= 0) {
        zeroTotalOrderIds.add(row.id as string);
      }
    }
  }

  grossRevenue = Math.round(grossRevenue * 100) / 100;
  serviceFee = Math.round(serviceFee * 100) / 100;
  const organizerNet = Math.round((grossRevenue - serviceFee) * 100) / 100;

  const tierStats = new Map<
    string,
    { sold: number; checkedIn: number; comp: number }
  >();
  for (const ticket of tickets) {
    const stat = tierStats.get(ticket.tierId) ?? {
      sold: 0,
      checkedIn: 0,
      comp: 0,
    };
    stat.sold += 1;
    if (ticket.status === "used") stat.checkedIn += 1;
    if (zeroTotalOrderIds.has(ticket.orderId)) stat.comp += 1;
    tierStats.set(ticket.tierId, stat);
  }

  const byTier = tiers.map((tier) => {
    const stat = tierStats.get(tier.id) ?? { sold: 0, checkedIn: 0, comp: 0 };
    const paidSold = Math.max(0, stat.sold - stat.comp);
    return {
      tierId: tier.id,
      tierName: tier.name,
      price: tier.price,
      capacity: tier.capacity,
      sold: stat.sold,
      checkedIn: stat.checkedIn,
      comp: stat.comp,
      revenue: Math.round(tier.price * paidSold * 100) / 100,
    };
  });

  const totalTickets = tickets.length;
  const checkedIn = tickets.filter((t) => t.status === "used").length;
  const compTickets = tickets.filter((t) =>
    zeroTotalOrderIds.has(t.orderId),
  ).length;

  return {
    grossRevenue,
    serviceFee,
    organizerNet,
    orderCount,
    totalTickets,
    checkedIn,
    checkInRate: totalTickets > 0 ? checkedIn / totalTickets : 0,
    compTickets,
    byTier,
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
