import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isFeeIncomplete,
  revenueFromDbRow,
} from "@/lib/payments/order-revenue";
import {
  computeEventPayoutAvailability,
  getOrganizerPayoutStage,
  getPayoutStageLabel,
  isOrganizerPayoutVerified,
  type PayoutStage,
  type PayoutVerificationMethod,
} from "@/lib/payments/payout-stages";
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
  held: number;
  withdrawable: number;
  payoutStage: PayoutStage;
  payoutStageLabel: string;
  payoutVerified: boolean;
  payoutVerifiedAt: string | null;
  payoutVerificationMethod: PayoutVerificationMethod | null;
  payoutVerificationNotes: string | null;
  completedPaidEventCount: number;
};

export type OrganizerEventPayoutRow = {
  slug: string;
  title: string;
  date: string;
  endDate: string | null;
  collected: number;
  ticketRevenue: number;
  platformFee: number;
  organizerOwed: number;
  orderCount: number;
  ticketCount: number;
  feeIncomplete: boolean;
  held: number;
  withdrawable: number;
  paidOut: number;
};

export type OrganizerPayoutRecord = {
  id: string;
  amount: number;
  paidAt: string;
  reference: string | null;
  notes: string | null;
  eventSlug: string | null;
  createdAt: string;
};

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function isPastEventDate(dateStr: string): boolean {
  const end = new Date(`${dateStr}T23:59:59`);
  return end.getTime() < Date.now();
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

async function loadPaidOutByEvent(): Promise<Map<string, number>> {
  const supabase = getSupabaseAdmin();
  const map = new Map<string, number>();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from("organizer_payouts")
    .select("event_slug, amount");

  if (error) {
    if (error.message.includes("Could not find the table")) return map;
    return map;
  }

  for (const row of data ?? []) {
    const slug = row.event_slug as string | null;
    if (!slug) continue;
    map.set(slug, roundCurrency((map.get(slug) ?? 0) + Number(row.amount)));
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

type OrganizerMeta = {
  payoutVerifiedAt: string | null;
  payoutVerificationMethod: PayoutVerificationMethod | null;
  payoutVerificationNotes: string | null;
};

async function countCompletedPaidEventsByOrganizer(): Promise<
  Map<string, number>
> {
  const supabase = getSupabaseAdmin();
  const map = new Map<string, number>();
  if (!supabase) return map;

  const [{ data: events }, { data: orders }] = await Promise.all([
    supabase.from("events").select("slug, organizer_id, date"),
    supabase
      .from("orders")
      .select("event_slug, total_amount")
      .eq("status", "confirmed")
      .gt("total_amount", 0),
  ]);

  const paidEventSlugs = new Set<string>();
  for (const row of orders ?? []) {
    paidEventSlugs.add(row.event_slug as string);
  }

  for (const row of events ?? []) {
    const slug = row.slug as string;
    const organizerId = row.organizer_id as string | null;
    const date = row.date as string;
    if (!organizerId || !paidEventSlugs.has(slug) || !isPastEventDate(date)) {
      continue;
    }
    map.set(organizerId, (map.get(organizerId) ?? 0) + 1);
  }

  return map;
}

function aggregateEventAvailability(
  stage: PayoutStage,
  events: OrganizerEventPayoutRow[],
): { held: number; withdrawable: number } {
  return events.reduce(
    (acc, event) => ({
      held: roundCurrency(acc.held + event.held),
      withdrawable: roundCurrency(acc.withdrawable + event.withdrawable),
    }),
    { held: 0, withdrawable: 0 },
  );
}

export async function getOrganizerPayoutSummaries(): Promise<
  OrganizerPayoutSummary[]
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const [
    eventOrganizerMap,
    paidOutMap,
    completedPaidEventsMap,
    organizersRes,
    ordersRes,
    eventsRes,
    paidOutByEventMap,
  ] = await Promise.all([
    loadEventOrganizerMap(),
    loadPaidOutByOrganizer(),
    countCompletedPaidEventsByOrganizer(),
    supabase
      .from("organizers")
      .select(
        "id, email, name, slug, status, invoice_company_name, invoice_address_line1, invoice_address_line2, invoice_city, invoice_province, invoice_postal_code, vat_number, payout_verified_at, payout_verification_method, payout_verification_notes",
      )
      .order("name", { ascending: true }),
    supabase
      .from("orders")
      .select(
        "event_slug, subtotal_amount, total_amount, service_fee, booking_fee, discount_amount",
      )
      .eq("status", "confirmed"),
    supabase.from("events").select("slug, title, date, end_date, organizer_id"),
    loadPaidOutByEvent(),
  ]);

  const aggregated = new Map<string, AggregatedOrganizer>();
  const eventStats = new Map<
    string,
    {
      collected: number;
      ticketRevenue: number;
      platformFee: number;
      organizerOwed: number;
      orderCount: number;
    }
  >();

  for (const row of ordersRes.data ?? []) {
    const eventSlug = row.event_slug as string;
    const organizerId = eventOrganizerMap.get(eventSlug);
    if (!organizerId) continue;

    const { collected, ticketAmount, serviceFee, organizerNet } =
      revenueFromDbRow(row);
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

    const eventCurrent = eventStats.get(eventSlug) ?? {
      collected: 0,
      ticketRevenue: 0,
      platformFee: 0,
      organizerOwed: 0,
      orderCount: 0,
    };
    eventCurrent.orderCount += 1;
    eventCurrent.collected = roundCurrency(eventCurrent.collected + collected);
    eventCurrent.ticketRevenue = roundCurrency(
      eventCurrent.ticketRevenue + ticketAmount,
    );
    eventCurrent.platformFee = roundCurrency(
      eventCurrent.platformFee + serviceFee,
    );
    eventCurrent.organizerOwed = roundCurrency(
      eventCurrent.organizerOwed + organizerNet,
    );
    eventStats.set(eventSlug, eventCurrent);
  }

  const eventsByOrganizer = new Map<string, OrganizerEventPayoutRow[]>();
  for (const row of eventsRes.data ?? []) {
    const organizerId = row.organizer_id as string | null;
    const slug = row.slug as string;
    if (!organizerId) continue;

    const stats = eventStats.get(slug) ?? {
      collected: 0,
      ticketRevenue: 0,
      platformFee: 0,
      organizerOwed: 0,
      orderCount: 0,
    };
    const paidOut = paidOutByEventMap.get(slug) ?? 0;
    const completedCount = completedPaidEventsMap.get(organizerId) ?? 0;
    const organizerRow = organizersRes.data?.find((o) => o.id === organizerId);
    const verified = isOrganizerPayoutVerified({
      payoutVerifiedAt: (organizerRow?.payout_verified_at as string) ?? null,
    });
    const stage = getOrganizerPayoutStage(completedCount, verified);
    const availability = computeEventPayoutAvailability({
      stage,
      eventDate: row.date as string,
      eventEndDate: (row.end_date as string) ?? null,
      organizerNet: stats.organizerOwed,
      paidOut,
    });

    const eventRow: OrganizerEventPayoutRow = {
      slug,
      title: row.title as string,
      date: row.date as string,
      endDate: (row.end_date as string) ?? null,
      collected: stats.collected,
      ticketRevenue: stats.ticketRevenue,
      platformFee: stats.platformFee,
      organizerOwed: stats.organizerOwed,
      orderCount: stats.orderCount,
      ticketCount: 0,
      feeIncomplete: isFeeIncomplete(stats.ticketRevenue, stats.platformFee),
      held: availability.held,
      withdrawable: availability.withdrawable,
      paidOut,
    };

    const list = eventsByOrganizer.get(organizerId) ?? [];
    list.push(eventRow);
    eventsByOrganizer.set(organizerId, list);
  }

  return (organizersRes.data ?? []).map((row) => {
    const id = row.id as string;
    const stats = aggregated.get(id);
    const organizerOwed = stats?.organizerOwed ?? 0;
    const paidOut = paidOutMap.get(id) ?? 0;
    const completedPaidEventCount = completedPaidEventsMap.get(id) ?? 0;
    const payoutVerifiedAt = (row.payout_verified_at as string) ?? null;
    const payoutVerified = isOrganizerPayoutVerified({
      payoutVerifiedAt,
    });
    const payoutStage = getOrganizerPayoutStage(
      completedPaidEventCount,
      payoutVerified,
    );
    const organizerEvents = eventsByOrganizer.get(id) ?? [];
    const { held, withdrawable } = aggregateEventAvailability(
      payoutStage,
      organizerEvents,
    );

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
      held,
      withdrawable,
      payoutStage,
      payoutStageLabel: getPayoutStageLabel(payoutStage),
      payoutVerified,
      payoutVerifiedAt,
      payoutVerificationMethod:
        (row.payout_verification_method as PayoutVerificationMethod) ?? null,
      payoutVerificationNotes:
        (row.payout_verification_notes as string) ?? null,
      completedPaidEventCount,
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
  const summaries = await getOrganizerPayoutSummaries();
  const summary = summaries.find((s) => s.id === organizerId) ?? null;
  if (!summary) {
    return { summary: null, events: [], payouts: [] };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { summary, events: [], payouts: [] };
  }

  const [{ data: eventRows }, { data: ticketRows }] = await Promise.all([
    supabase
      .from("events")
      .select("slug, title, date, end_date")
      .eq("organizer_id", organizerId)
      .order("date", { ascending: true }),
    supabase.from("tickets").select("event_slug"),
  ]);

  const ticketCounts = new Map<string, number>();
  for (const row of ticketRows ?? []) {
    const slug = row.event_slug as string;
    ticketCounts.set(slug, (ticketCounts.get(slug) ?? 0) + 1);
  }

  const allSummaries = await getOrganizerPayoutSummaries();
  const fullSummary = allSummaries.find((s) => s.id === organizerId);
  const eventsFromSummaries = await buildOrganizerEventRows(
    supabase,
    organizerId,
    fullSummary ?? summary,
    eventRows ?? [],
    ticketCounts,
  );

  const payouts = await loadOrganizerPayoutRecords(supabase, organizerId);
  return { summary, events: eventsFromSummaries, payouts };
}

async function buildOrganizerEventRows(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  organizerId: string,
  summary: OrganizerPayoutSummary,
  eventRows: Record<string, unknown>[],
  ticketCounts: Map<string, number>,
): Promise<OrganizerEventPayoutRow[]> {
  const slugs = eventRows.map((e) => e.slug as string);
  if (slugs.length === 0) return [];

  const [{ data: orderRows }, paidOutByEventMap] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "event_slug, subtotal_amount, total_amount, service_fee, booking_fee, discount_amount",
      )
      .in("event_slug", slugs)
      .eq("status", "confirmed"),
    loadPaidOutByEvent(),
  ]);

  const eventStats = new Map<
    string,
    {
      collected: number;
      ticketRevenue: number;
      platformFee: number;
      organizerOwed: number;
      orderCount: number;
    }
  >();

  for (const row of orderRows ?? []) {
    const slug = row.event_slug as string;
    const { collected, ticketAmount, serviceFee, organizerNet } =
      revenueFromDbRow(row);
    const current = eventStats.get(slug) ?? {
      collected: 0,
      ticketRevenue: 0,
      platformFee: 0,
      organizerOwed: 0,
      orderCount: 0,
    };
    current.orderCount += 1;
    current.collected = roundCurrency(current.collected + collected);
    current.ticketRevenue = roundCurrency(
      current.ticketRevenue + ticketAmount,
    );
    current.platformFee = roundCurrency(current.platformFee + serviceFee);
    current.organizerOwed = roundCurrency(current.organizerOwed + organizerNet);
    eventStats.set(slug, current);
  }

  return eventRows.map((row) => {
    const slug = row.slug as string;
    const stats = eventStats.get(slug) ?? {
      collected: 0,
      ticketRevenue: 0,
      platformFee: 0,
      organizerOwed: 0,
      orderCount: 0,
    };
    const paidOut = paidOutByEventMap.get(slug) ?? 0;
    const availability = computeEventPayoutAvailability({
      stage: summary.payoutStage,
      eventDate: row.date as string,
      eventEndDate: (row.end_date as string) ?? null,
      organizerNet: stats.organizerOwed,
      paidOut,
    });

    return {
      slug,
      title: row.title as string,
      date: row.date as string,
      endDate: (row.end_date as string) ?? null,
      collected: stats.collected,
      ticketRevenue: stats.ticketRevenue,
      platformFee: stats.platformFee,
      organizerOwed: stats.organizerOwed,
      orderCount: stats.orderCount,
      ticketCount: ticketCounts.get(slug) ?? 0,
      feeIncomplete: isFeeIncomplete(stats.ticketRevenue, stats.platformFee),
      held: availability.held,
      withdrawable: availability.withdrawable,
      paidOut,
    };
  });
}

async function loadOrganizerPayoutRecords(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  organizerId: string,
): Promise<OrganizerPayoutRecord[]> {
  const { data: payoutRows, error: payoutError } = await supabase
    .from("organizer_payouts")
    .select("id, amount, paid_at, reference, notes, event_slug, created_at")
    .eq("organizer_id", organizerId)
    .order("paid_at", { ascending: false });

  if (payoutError || !payoutRows) return [];

  return payoutRows.map((row) => ({
    id: row.id as string,
    amount: Number(row.amount),
    paidAt: row.paid_at as string,
    reference: (row.reference as string) ?? null,
    notes: (row.notes as string) ?? null,
    eventSlug: (row.event_slug as string) ?? null,
    createdAt: row.created_at as string,
  }));
}
