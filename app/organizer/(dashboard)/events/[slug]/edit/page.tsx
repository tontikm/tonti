import { notFound } from "next/navigation";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { EventForm, type EventFormInitial } from "@/components/organizer/EventForm";
import { getAllArtists } from "@/lib/data/artists";
import { getEventBySlug } from "@/lib/data/events";
import { getAllVenues } from "@/lib/data/venues";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { isoToSastDateAndTime } from "@/lib/utils";
import { ORGANIZER_BRANDING_MIGRATION_HINT } from "@/lib/supabase/errors";
import { updateEvent } from "@/app/organizer/actions";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? `Edit ${event.title}` : "Edit event",
  };
}

export default async function EditOrganizerEventPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const showOrganizerMigrationHint = query.organizerMigration === "1";
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const supabaseReady = isSupabaseAdminConfigured();
  const [venues, artists] = await Promise.all([
    getAllVenues(),
    getAllArtists(),
  ]);
  const showTime = new Date(event.showTime);
  const doorsTime = new Date(event.doorsTime);
  const doorsMinutes = Math.max(
    0,
    Math.round((showTime.getTime() - doorsTime.getTime()) / 60000),
  );

  const show = isoToSastDateAndTime(event.showTime);
  const end = event.endDate
    ? isoToSastDateAndTime(event.endDate)
    : { date: "", time: show.time };

  const initial: EventFormInitial = {
    slug: event.slug,
    title: event.title,
    subtitle: event.subtitle,
    description: event.description,
    image: event.image,
    showDate: show.date,
    showTime: show.time,
    endDate: end.date,
    doorsMinutes,
    category: event.category,
    venueName: event.venue.name,
    venueSlug: event.venue.slug,
    artistNames: event.artists.map((artist) => artist.name),
    artistSlugs: event.artists.map((artist) => artist.slug),
    ageLimit: event.ageLimit,
    ageMax: event.ageMax,
    tags: event.tags,
    prohibitedItems: event.prohibitedItems,
    featured: event.featured,
    showOrganizerProfile: event.showOrganizerProfile ?? false,
    organizerName: event.organizerName,
    organizerLogo: event.organizerLogo,
    tiers: event.tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      price: tier.price,
      capacity: tier.capacity,
      description: tier.description,
    })),
  };

  return (
    <>
      <OrganizerPageHeader
        title="Edit event"
        description={`Update ${event.title}. Sold ticket counts are preserved when you save.`}
      />

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Connect Supabase before saving changes — add{" "}
          <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
          <code className="text-foreground">.env.local</code>.
        </div>
      )}

      {showOrganizerMigrationHint && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          {ORGANIZER_BRANDING_MIGRATION_HINT}
        </div>
      )}

      <div className="max-w-3xl">
        <EventForm
          venues={venues}
          artists={artists}
          action={updateEvent}
          submitLabel="Save changes"
          initial={initial}
        />
      </div>
    </>
  );
}
