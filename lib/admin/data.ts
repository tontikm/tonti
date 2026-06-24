import { cache } from "react";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isMissingColumnError } from "@/lib/supabase/errors";
import {
  EMPTY_EVENT_SALES,
  getAdminEventSalesSummaries,
  type AdminEventSalesSummary,
} from "@/lib/admin/sales";

export type { AdminEventSalesSummary };

import type { EventPublicationStatus } from "@/lib/types";

export type OrganizerStatus = "pending" | "approved" | "suspended";

export type { EventPublicationStatus };

export type AdminOrganizerRow = {
  id: string;
  email: string;
  name: string | null;
  slug: string | null;
  status: OrganizerStatus;
  createdAt: string;
  eventCount: number;
};

export type AdminOrderRow = {
  id: string;
  eventSlug: string;
  buyerName: string;
  buyerEmail: string;
  totalAmount: number;
  subtotalAmount: number;
  serviceFee: number;
  status: string;
  paymentProvider: string | null;
  paymentReference: string | null;
  ticketCount: number;
  createdAt: string;
};

export type AdminEventRow = {
  slug: string;
  title: string;
  date: string;
  featured: boolean;
  organizerId: string | null;
  organizerName: string | null;
  organizerStatus: OrganizerStatus | null;
  publicationStatus: EventPublicationStatus;
  isPubliclyVisible: boolean;
  sales: AdminEventSalesSummary;
};

const loadApprovedOrganizerIds = cache(async (): Promise<Set<string>> => {
  const supabase = getSupabaseAdmin();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from("organizers")
    .select("id")
    .eq("status", "approved");

  if (error) {
    if (isMissingColumnError(error)) return new Set();
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.id as string));
});

export async function getApprovedOrganizerIds(): Promise<Set<string>> {
  return loadApprovedOrganizerIds();
}

export function isEventPubliclyVisible(
  event: {
    organizerId?: string | null;
    publicationStatus?: EventPublicationStatus | null;
  },
  approvedOrganizerIds: Set<string>,
): boolean {
  const publicationStatus = event.publicationStatus ?? "approved";
  if (publicationStatus !== "approved") return false;
  if (!event.organizerId) return true;
  return approvedOrganizerIds.has(event.organizerId);
}

export async function listAdminOrganizers(
  statusFilter?: OrganizerStatus,
): Promise<AdminOrganizerRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("organizers")
    .select("id, email, name, slug, status, created_at")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const organizers = data as Array<Record<string, unknown>>;
  const ids = organizers.map((o) => o.id as string);

  const eventCounts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: events } = await supabase
      .from("events")
      .select("organizer_id")
      .in("organizer_id", ids);

    for (const row of events ?? []) {
      const oid = row.organizer_id as string;
      eventCounts.set(oid, (eventCounts.get(oid) ?? 0) + 1);
    }
  }

  return organizers.map((row) => ({
    id: row.id as string,
    email: row.email as string,
    name: (row.name as string) ?? null,
    slug: (row.slug as string) ?? null,
    status: (row.status as OrganizerStatus) ?? "pending",
    createdAt: row.created_at as string,
    eventCount: eventCounts.get(row.id as string) ?? 0,
  }));
}

export async function listAdminEvents(): Promise<AdminEventRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const [approvedIds, salesBySlug] = await Promise.all([
    getApprovedOrganizerIds(),
    getAdminEventSalesSummaries(),
  ]);

  const { data: events, error } = await supabase
    .from("events")
    .select(
      "slug, title, date, featured, organizer_id, organizer_name, publication_status",
    )
    .order("date", { ascending: true });

  if (error || !events) return [];

  const organizerIds = [
    ...new Set(
      events
        .map((e) => e.organizer_id as string | null)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const statusByOrganizerId = new Map<string, OrganizerStatus>();
  if (organizerIds.length > 0) {
    const { data: organizers } = await supabase
      .from("organizers")
      .select("id, status")
      .in("id", organizerIds);

    for (const org of organizers ?? []) {
      statusByOrganizerId.set(
        org.id as string,
        (org.status as OrganizerStatus) ?? "pending",
      );
    }
  }

  return events
    .map((row) => {
      const organizerId = (row.organizer_id as string) ?? null;
      const organizerStatus = organizerId
        ? (statusByOrganizerId.get(organizerId) ?? null)
        : null;
      const slug = row.slug as string;
      const publicationStatus =
        (row.publication_status as EventPublicationStatus | null) ?? "approved";

      return {
        slug,
        title: row.title as string,
        date: row.date as string,
        featured: Boolean(row.featured),
        organizerId,
        organizerName: (row.organizer_name as string) ?? null,
        organizerStatus,
        publicationStatus,
        isPubliclyVisible: isEventPubliclyVisible(
          { organizerId, publicationStatus },
          approvedIds,
        ),
        sales: salesBySlug.get(slug) ?? { ...EMPTY_EVENT_SALES },
      };
    }).sort((a, b) => {
    const pendingA = a.publicationStatus === "pending" ? 0 : 1;
    const pendingB = b.publicationStatus === "pending" ? 0 : 1;
    if (pendingA !== pendingB) return pendingA - pendingB;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

export async function listAdminOrders(
  limit = 100,
  eventSlug?: string,
): Promise<AdminOrderRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("orders")
    .select(
      "id, event_slug, buyer_name, buyer_email, total_amount, subtotal_amount, service_fee, status, payment_provider, payment_reference, ticket_count, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (eventSlug) {
    query = query.eq("event_slug", eventSlug);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    eventSlug: row.event_slug as string,
    buyerName: row.buyer_name as string,
    buyerEmail: row.buyer_email as string,
    totalAmount: Number(row.total_amount ?? 0),
    subtotalAmount: Number(row.subtotal_amount ?? row.total_amount ?? 0),
    serviceFee: Number(row.service_fee ?? 0),
    status: row.status as string,
    paymentProvider: (row.payment_provider as string) ?? null,
    paymentReference: (row.payment_reference as string) ?? null,
    ticketCount: Number(row.ticket_count ?? 0),
    createdAt: row.created_at as string,
  }));
}
