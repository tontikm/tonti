import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isFeeIncomplete,
  revenueFromDbRow,
} from "@/lib/payments/order-revenue";
import type { OrganizerStatus } from "@/lib/admin/data";

export type OrganizerPayoutSummary = {
  id: string;
  name: string | null;
  email: string;
  slug: string | null;
  status: OrganizerStatus;
  invoiceCompanyName: string | null;
  invoiceAddressLine1: string | null;
  invoiceAddressLine2: string | null;
  invoiceCity: string | null;
  invoiceProvince: string | null;
  invoicePostalCode: string | null;
  vatNumber: string | null;
  eventCount: number;
  orderCount: number;
  collected: number;
  platformFee: number;
  organizerOwed: number;
  paidOut: number;
  outstanding: number;
};

export type OrganizerEventPayoutRow = {
  slug: string;
  title: string;
  date: string;
  collected: number;
  platformFee: number;
  organizerOwed: number;
  orderCount: number;
  ticketCount: number;
  feeIncomplete: boolean;
};

export type OrganizerPayoutRecord = {
  id: string;
  amount: number;
  paidAt: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
};

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

async function loadEventOrganizerMap(): Promise<Map<string, string>> {
  const supabase = getSupabaseAdmin();
  const map = new Map<string, string>();
  if (!supabase) return map;

  const { data } = await supabase
    .from("events")
    .select("slug, organizer_id");

  for (const row of data ?? []) {
    const organizerId = row.organizer_id as string | null;
    if (organizerId) {
      map.set(row.slug as string, organizerId);
    }
  }

  return map;
}

async function loadPaidOutByOrganizer(): Promise<Map<string, number>> {
  const supabase = getSupabaseAdmin();
  const map = new Map<string, number>();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from("organizer_payouts")
    .select("organizer_id, amount");

  if (error) {
    if (error.message.includes("Could not find the table")) return map;
    return map;
  }

  for (const row of data ?? []) {
    const id = row.organizer_id as string;
    map.set(id, roundCurrency((map.get(id) ?? 0) + Number(row.amount)));
  }

  return map;
}

type AggregatedOrganizer = {
  eventSlugs: Set<string>;
  orderCount: number;
  collected: number;
  platformFee: number;
  organizerOwed: number;
};

export async function getOrganizerPayoutSummaries(): Promise<
  OrganizerPayoutSummary[]
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const [eventOrganizerMap, paidOutMap, organizersRes, ordersRes] =
    await Promise.all([
      loadEventOrganizerMap(),
      loadPaidOutByOrganizer(),
      supabase
        .from("organizers")
        .select(
          "id, email, name, slug, status, invoice_company_name, invoice_address_line1, invoice_address_line2, invoice_city, invoice_province, invoice_postal_code, vat_number",
        )
        .order("name", { ascending: true }),
      supabase
        .from("orders")
        .select("event_slug, subtotal_amount, total_amount, service_fee")
        .eq("status", "confirmed"),
    ]);

  const aggregated = new Map<string, AggregatedOrganizer>();

  for (const row of ordersRes.data ?? []) {
    const eventSlug = row.event_slug as string;
    const organizerId = eventOrganizerMap.get(eventSlug);
    if (!organizerId) continue;

    const { collected, serviceFee, organizerNet } = revenueFromDbRow(row);
    const current = aggregated.get(organizerId) ?? {
      eventSlugs: new Set<string>(),
      orderCount: 0,
      collected: 0,
      platformFee: 0,
      organizerOwed: 0,
    };
    current.eventSlugs.add(eventSlug);
    current.orderCount += 1;
    current.collected = roundCurrency(current.collected + collected);
    current.platformFee = roundCurrency(current.platformFee + serviceFee);
    current.organizerOwed = roundCurrency(current.organizerOwed + organizerNet);
    aggregated.set(organizerId, current);
  }

  return (organizersRes.data ?? []).map((row) => {
    const id = row.id as string;
    const stats = aggregated.get(id);
    const organizerOwed = stats?.organizerOwed ?? 0;
    const paidOut = paidOutMap.get(id) ?? 0;

    return {
      id,
      name: (row.name as string) ?? null,
      email: row.email as string,
      slug: (row.slug as string) ?? null,
      status: (row.status as OrganizerStatus) ?? "pending",
      invoiceCompanyName: (row.invoice_company_name as string) ?? null,
      invoiceAddressLine1: (row.invoice_address_line1 as string) ?? null,
      invoiceAddressLine2: (row.invoice_address_line2 as string) ?? null,
      invoiceCity: (row.invoice_city as string) ?? null,
      invoiceProvince: (row.invoice_province as string) ?? null,
      invoicePostalCode: (row.invoice_postal_code as string) ?? null,
      vatNumber: (row.vat_number as string) ?? null,
      eventCount: stats?.eventSlugs.size ?? 0,
      orderCount: stats?.orderCount ?? 0,
      collected: stats?.collected ?? 0,
      platformFee: stats?.platformFee ?? 0,
      organizerOwed,
      paidOut,
      outstanding: roundCurrency(Math.max(0, organizerOwed - paidOut)),
    };
  });
}

export async function getTotalOutstandingOwed(): Promise<number> {
  const summaries = await getOrganizerPayoutSummaries();
  return roundCurrency(
    summaries.reduce((sum, row) => sum + row.outstanding, 0),
  );
}

export async function getOrganizerPayoutDetail(organizerId: string): Promise<{
  summary: OrganizerPayoutSummary | null;
  events: OrganizerEventPayoutRow[];
  payouts: OrganizerPayoutRecord[];
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { summary: null, events: [], payouts: [] };
  }

  const summaries = await getOrganizerPayoutSummaries();
  const summary = summaries.find((s) => s.id === organizerId) ?? null;

  const { data: eventRows } = await supabase
    .from("events")
    .select("slug, title, date")
    .eq("organizer_id", organizerId)
    .order("date", { ascending: true });

  const slugs = (eventRows ?? []).map((e) => e.slug as string);
  const eventStats = new Map<
    string,
    {
      collected: number;
      platformFee: number;
      organizerOwed: number;
      orderCount: number;
    }
  >();

  if (slugs.length > 0) {
    const [{ data: orderRows }, { data: ticketRows }] = await Promise.all([
      supabase
        .from("orders")
        .select("event_slug, subtotal_amount, total_amount, service_fee")
        .in("event_slug", slugs)
        .eq("status", "confirmed"),
      supabase.from("tickets").select("event_slug").in("event_slug", slugs),
    ]);

    for (const row of orderRows ?? []) {
      const slug = row.event_slug as string;
      const { collected, serviceFee, organizerNet } = revenueFromDbRow(row);
      const current = eventStats.get(slug) ?? {
        collected: 0,
        platformFee: 0,
        organizerOwed: 0,
        orderCount: 0,
      };
      current.orderCount += 1;
      current.collected = roundCurrency(current.collected + collected);
      current.platformFee = roundCurrency(current.platformFee + serviceFee);
      current.organizerOwed = roundCurrency(current.organizerOwed + organizerNet);
      eventStats.set(slug, current);
    }

    const ticketCounts = new Map<string, number>();
    for (const row of ticketRows ?? []) {
      const slug = row.event_slug as string;
      ticketCounts.set(slug, (ticketCounts.get(slug) ?? 0) + 1);
    }

    const events: OrganizerEventPayoutRow[] = (eventRows ?? []).map((row) => {
      const slug = row.slug as string;
      const stats = eventStats.get(slug) ?? {
        collected: 0,
        platformFee: 0,
        organizerOwed: 0,
        orderCount: 0,
      };
      return {
        slug,
        title: row.title as string,
        date: row.date as string,
        ...stats,
        ticketCount: ticketCounts.get(slug) ?? 0,
        feeIncomplete: isFeeIncomplete(stats.collected, stats.platformFee),
      };
    });

    const payouts = await loadOrganizerPayoutRecords(supabase, organizerId);
    return { summary, events, payouts };
  }

  const payouts = await loadOrganizerPayoutRecords(supabase, organizerId);
  return { summary, events: [], payouts };
}

async function loadOrganizerPayoutRecords(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  organizerId: string,
): Promise<OrganizerPayoutRecord[]> {
  const { data: payoutRows, error: payoutError } = await supabase
    .from("organizer_payouts")
    .select("id, amount, paid_at, reference, notes, created_at")
    .eq("organizer_id", organizerId)
    .order("paid_at", { ascending: false });

  if (payoutError || !payoutRows) return [];

  return payoutRows.map((row) => ({
    id: row.id as string,
    amount: Number(row.amount),
    paidAt: row.paid_at as string,
    reference: (row.reference as string) ?? null,
    notes: (row.notes as string) ?? null,
    createdAt: row.created_at as string,
  }));
}
