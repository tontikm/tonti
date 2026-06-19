import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { VenueForm } from "@/components/organizer/VenueForm";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const metadata = { title: "Add venue" };

export default function NewOrganizerVenuePage() {
  const supabaseReady = isSupabaseAdminConfigured();

  return (
    <>
      <OrganizerPageHeader
        title="Add venue"
        description="New venues appear in the dropdown when you create or edit events."
      />

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Supabase is required to save venues.
        </div>
      )}

      <VenueForm />
    </>
  );
}
