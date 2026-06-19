import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { ArtistForm } from "@/components/organizer/ArtistForm";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const metadata = { title: "Add artist" };

export default function NewOrganizerArtistPage() {
  const supabaseReady = isSupabaseAdminConfigured();

  return (
    <>
      <OrganizerPageHeader
        title="Add artist"
        description="New artists appear in the lineup selector when you create events."
      />

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Supabase is required to save artists.
        </div>
      )}

      <ArtistForm />
    </>
  );
}
