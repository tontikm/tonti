import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { EventCreateWizard } from "@/components/organizer/EventCreateWizard";
import { PlatformFeeNotice } from "@/components/organizer/PlatformFeeNotice";
import { getAllArtists } from "@/lib/data/artists";
import { getAllVenues } from "@/lib/data/venues";
import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { getOrganizerSession } from "@/lib/organizer/session";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const metadata = {
  title: "Create event",
};

export default async function NewOrganizerEventPage() {
  const supabaseReady = isSupabaseAdminConfigured();
  const session = await getOrganizerSession();
  const profile = session ? await getOrganizerByEmail(session.email) : null;
  const [venues, artists] = await Promise.all([
    getAllVenues(),
    getAllArtists(),
  ]);

  const defaults = {
    id: profile?.id ?? session?.id ?? null,
    name: profile?.name ?? session?.name ?? null,
    logo: profile?.logo ?? null,
    email: profile?.email ?? session?.email ?? "",
  };

  return (
    <>
      <OrganizerPageHeader
        title="Create event"
        description="Walk through each step to publish a new music event. All times are SAST."
      />

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Connect Supabase before publishing — the wizard is available for
          preview, but submissions will fail until{" "}
          <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> is
          set.
        </div>
      )}

      {venues.length === 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm">
          Add a venue before creating an event.
        </div>
      )}

      <PlatformFeeNotice variant="banner" className="mb-6" />

      <EventCreateWizard venues={venues} artists={artists} defaults={defaults} />
    </>
  );
}
