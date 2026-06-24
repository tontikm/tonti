import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { revenueFromDbRow } from "@/lib/payments/order-revenue";

export type PlatformDashboardStats = {
  organizerCount: number;
  pendingOrganizerCount: number;
  approvedOrganizerCount: number;
  suspendedOrganizerCount: number;
  eventCount: number;
  pendingEventCount: number;
  featuredEventCount: number;
  orderCount: number;
  confirmedOrderCount: number;
  totalServiceFee: number;
  totalGrossRevenue: number;
  totalOrganizerNet: number;
};

export async function getPlatformDashboardStats(): Promise<PlatformDashboardStats> {
  const empty: PlatformDashboardStats = {
    organizerCount: 0,
    pendingOrganizerCount: 0,
    approvedOrganizerCount: 0,
    suspendedOrganizerCount: 0,
    eventCount: 0,
    pendingEventCount: 0,
    featuredEventCount: 0,
    orderCount: 0,
    confirmedOrderCount: 0,
    totalServiceFee: 0,
    totalGrossRevenue: 0,
    totalOrganizerNet: 0,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) return empty;

  const [
    organizersRes,
    eventsRes,
    pendingEventsRes,
    featuredRes,
    ordersRes,
    confirmedOrdersRes,
  ] = await Promise.all([
    supabase.from("organizers").select("status"),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("publication_status", "pending"),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("featured", true),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("subtotal_amount, total_amount, service_fee")
      .eq("status", "confirmed"),
  ]);

  const organizers = organizersRes.data ?? [];
  const confirmedOrders = confirmedOrdersRes.data ?? [];

  let totalServiceFee = 0;
  let totalGrossRevenue = 0;
  let totalOrganizerNet = 0;
  for (const order of confirmedOrders) {
    const { collected, serviceFee, organizerNet } = revenueFromDbRow(order);
    totalServiceFee += serviceFee;
    totalGrossRevenue += collected;
    totalOrganizerNet += organizerNet;
  }

  return {
    organizerCount: organizers.length,
    pendingOrganizerCount: organizers.filter((o) => o.status === "pending").length,
    approvedOrganizerCount: organizers.filter((o) => o.status === "approved").length,
    suspendedOrganizerCount: organizers.filter((o) => o.status === "suspended").length,
    eventCount: eventsRes.count ?? 0,
    pendingEventCount: pendingEventsRes.count ?? 0,
    featuredEventCount: featuredRes.count ?? 0,
    orderCount: ordersRes.count ?? 0,
    confirmedOrderCount: confirmedOrders.length,
    totalServiceFee: Math.round(totalServiceFee * 100) / 100,
    totalGrossRevenue: Math.round(totalGrossRevenue * 100) / 100,
    totalOrganizerNet: Math.round(totalOrganizerNet * 100) / 100,
  };
}
