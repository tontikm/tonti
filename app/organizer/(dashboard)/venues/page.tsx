import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { Button } from "@/components/ui/Button";
import { getAllVenues } from "@/lib/data/venues";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const metadata = { title: "Venues" };

type Props = {
  searchParams: Promise<{ created?: string }>;
};

export default async function OrganizerVenuesPage({ searchParams }: Props) {
  const { created } = await searchParams;
  const venues = await getAllVenues();
  const supabaseReady = isSupabaseAdminConfigured();

  return (
    <>
      <OrganizerPageHeader
        title="Venues"
        description={`${venues.length} venue${venues.length !== 1 ? "s" : ""} available when creating events`}
        action={
          <Button href="/organizer/venues/new" size="md">
            <Plus className="h-4 w-4" />
            Add venue
          </Button>
        }
      />

      {created === "1" && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
          Venue added. It&apos;s now available in the event form.
        </div>
      )}

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Connect Supabase to save new venues. Until then, only seed venues are
          listed.
        </div>
      )}

      <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
        {venues.map((venue) => (
          <li key={venue.slug} className="px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{venue.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {venue.city}, {venue.province}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Capacity {venue.capacity.toLocaleString()} · {venue.slug}
                </p>
              </div>
              <Link
                href={`/venues/${venue.slug}`}
                className="text-sm text-muted hover:text-foreground"
              >
                View public page →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
