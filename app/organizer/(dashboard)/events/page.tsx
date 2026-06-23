import { Plus } from "lucide-react";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import {
  OrganizerEventsList,
  type OrganizerEventListItem,
} from "@/components/organizer/OrganizerEventsList";
import { Button } from "@/components/ui/Button";
import { getEventsForOrganizer } from "@/lib/data/events";
import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { getOrganizerSession } from "@/lib/organizer/session";
import { getOrganizerEventStats } from "@/lib/tickets";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getEventStatus, getLowestPrice } from "@/lib/utils";

export const metadata = {
  title: "Your events",
};

type Props = {
  searchParams: Promise<{ deleted?: string }>;
};

export default async function OrganizerEventsPage({ searchParams }: Props) {
  const { deleted } = await searchParams;
  const session = await getOrganizerSession();
  const profile = session ? await getOrganizerByEmail(session.email) : null;
  const events = await getEventsForOrganizer(
    profile?.id ?? session?.id,
    profile?.name ?? session?.name,
    profile?.email ?? session?.email,
  );
  const supabaseReady = isSupabaseAdminConfigured();
  const stats = await getOrganizerEventStats(events.map((event) => event.slug));

  const items: OrganizerEventListItem[] = events.map((event) => {
    const stat = stats.get(event.slug);
    return {
      slug: event.slug,
      title: event.title,
      image: event.image,
      hasImage: Boolean(event.image?.trim()),
      date: event.date,
      endDate: event.endDate,
      showTime: event.showTime,
      venueCity: event.venue.city,
      featured: event.featured,
      status: getEventStatus(event),
      ticketsIssued: stat?.ticketsIssued ?? 0,
      capacity: event.tiers.reduce((sum, tier) => sum + tier.capacity, 0),
      revenue: stat?.revenue ?? 0,
      lowestPrice: getLowestPrice(event.tiers),
    };
  });

  return (
    <>
      <OrganizerPageHeader
        title="Events"
        description={`${events.length} event${events.length !== 1 ? "s" : ""} on Spotra`}
        action={
          <Button href="/organizer/events/new" size="md" className="organizer-accent-btn">
            <Plus className="h-4 w-4" />
            New event
          </Button>
        }
      />

      {deleted === "1" && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-foreground">
          Event deleted.
        </div>
      )}

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Supabase is not configured. New events cannot be saved yet. Add{" "}
          <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
          <code className="text-foreground">.env.local</code> and run the
          migration + seed script.
        </div>
      )}

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="text-muted">You haven&apos;t listed any events yet.</p>
          <Button href="/organizer/events/new" className="mt-4" size="md">
            <Plus className="h-4 w-4" />
            Create your first event
          </Button>
        </div>
      ) : (
        <OrganizerEventsList items={items} supabaseReady={supabaseReady} />
      )}
    </>
  );
}
