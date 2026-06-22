import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminEventSalesSummary = {
  orderCount: number;
  ticketCount: number;
  grossRevenue: number;
  platformFee: number;
  organizerNet: number;
};

export const EMPTY_EVENT_SALES: AdminEventSalesSummary = {
  orderCount: 0,
  ticketCount: 0,
  grossRevenue: 0,
  platformFee: 0,
  organizerNet: 0,
};

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function accumulateSummary(
  map: Map<string, AdminEventSalesSummary>,
  eventSlug: string,
  patch: Partial<AdminEventSalesSummary>,
): void {
  const current = map.get(eventSlug) ?? { ...EMPTY_EVENT_SALES };
  map.set(eventSlug, {
    orderCount: current.orderCount + (patch.orderCount ?? 0),
    ticketCount: current.ticketCount + (patch.ticketCount ?? 0),
    grossRevenue: roundCurrency(
      current.grossRevenue + (patch.grossRevenue ?? 0),
    ),
    platformFee: roundCurrency(current.platformFee + (patch.platformFee ?? 0)),
    organizerNet: roundCurrency(
      current.organizerNet + (patch.organizerNet ?? 0),
    ),
  });
}

/** Confirmed-order revenue totals keyed by event slug. */
export async function getAdminEventSalesSummaries(): Promise<
  Map<string, AdminEventSalesSummary>
> {
  const supabase = getSupabaseAdmin();
  const map = new Map<string, AdminEventSalesSummary>();
  if (!supabase) return map;

  const [{ data: orderRows }, { data: ticketRows }] = await Promise.all([
    supabase
      .from("orders")
      .select("event_slug, subtotal_amount, total_amount, service_fee")
      .eq("status", "confirmed"),
    supabase.from("tickets").select("event_slug"),
  ]);

  for (const row of orderRows ?? []) {
    const slug = row.event_slug as string;
    const gross = Number(row.subtotal_amount ?? row.total_amount ?? 0);
    const fee = Number(row.service_fee ?? 0);
    accumulateSummary(map, slug, {
      orderCount: 1,
      grossRevenue: gross,
      platformFee: fee,
      organizerNet: gross - fee,
    });
  }

  const ticketCounts = new Map<string, number>();
  for (const row of ticketRows ?? []) {
    const slug = row.event_slug as string;
    ticketCounts.set(slug, (ticketCounts.get(slug) ?? 0) + 1);
  }

  for (const [slug, count] of ticketCounts) {
    const current = map.get(slug) ?? { ...EMPTY_EVENT_SALES };
    map.set(slug, { ...current, ticketCount: count });
  }

  return map;
}
