import { getEventsForOrganizer } from "@/lib/data/events";
import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { getOrganizerSession } from "@/lib/organizer/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";
import { isPastEvent } from "@/lib/utils";

export type OrganizerDashboardStats = {
  eventCount: number;
  upcomingCount: number;
  pastCount: number;
  totalTickets: number;
  checkedIn: number;
  pendingCheckIn: number;
  orderCount: number;
  upcomingEvents: Event[];
  pastEvents: Event[];
  recentEvents: Event[];
};

export async function getOrganizerDashboardStats(): Promise<OrganizerDashboardStats> {
  const session = await getOrganizerSession();
  const profile = session ? await getOrganizerByEmail(session.email) : null;
  const events = await getEventsForOrganizer(
    profile?.id ?? session?.id,
    profile?.name ?? session?.name,
    profile?.email ?? session?.email,
  );
  const upcomingEvents = events
    .filter((event) => !isPastEvent(event))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = events
    .filter((event) => isPastEvent(event))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
    pastCount: pastEvents.length,
    totalTickets,
    checkedIn,
    pendingCheckIn: Math.max(0, totalTickets - checkedIn),
    orderCount,
    upcomingEvents: upcomingEvents.slice(0, 5),
    pastEvents: pastEvents.slice(0, 5),
    recentEvents: events.slice(0, 5),
  };
}
