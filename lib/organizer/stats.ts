import { getAllEvents, getEventsForOrganizer } from "@/lib/data/events";
import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { getOrganizerSession } from "@/lib/organizer/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export type OrganizerDashboardStats = {
  eventCount: number;
  upcomingCount: number;
  totalTickets: number;
  checkedIn: number;
  pendingCheckIn: number;
  orderCount: number;
  upcomingEvents: Event[];
  recentEvents: Event[];
};

export async function getOrganizerDashboardStats(): Promise<OrganizerDashboardStats> {
  const session = await getOrganizerSession();
  const profile = session ? await getOrganizerByEmail(session.email) : null;
  const events = await getEventsForOrganizer(
    profile?.id ?? session?.id,
    profile?.name ?? session?.name,
  );
  const now = new Date();
  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalTickets = 0;
  let checkedIn = 0;
  let orderCount = 0;

  const supabase = getSupabaseServer();
  if (supabase) {
    const { count: ticketCount } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true });

    const { count: usedCount } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "used");

    const { count: orders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    totalTickets = ticketCount ?? 0;
    checkedIn = usedCount ?? 0;
    orderCount = orders ?? 0;
  }

  return {
    eventCount: events.length,
    upcomingCount: upcomingEvents.length,
    totalTickets,
    checkedIn,
    pendingCheckIn: Math.max(0, totalTickets - checkedIn),
    orderCount,
    upcomingEvents: upcomingEvents.slice(0, 5),
    recentEvents: events.slice(0, 5),
  };
}
