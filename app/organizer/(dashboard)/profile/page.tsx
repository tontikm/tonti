import { redirect } from "next/navigation";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { OrganizerProfileView } from "@/components/organizer/OrganizerProfileView";
import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { getOrganizerSession } from "@/lib/organizer/session";

export const metadata = {
  title: "Profile",
};

type Props = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function OrganizerProfilePage({ searchParams }: Props) {
  const session = await getOrganizerSession();
  if (!session) redirect("/organizer/login");

  const profile = await getOrganizerByEmail(session.email);
  if (!profile) {
    return (
      <>
        <OrganizerPageHeader
          title="Profile"
          description="Your organizer profile could not be loaded."
        />
        <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Run{" "}
          <code className="text-foreground">
            supabase/migrations/0008_organizer_profiles.sql
          </code>{" "}
          in the Supabase SQL editor.
        </div>
      </>
    );
  }

  const { saved } = await searchParams;

  return (
    <>
      <OrganizerPageHeader
        title="Profile"
        description="Your public organizer page, contact details, and billing info."
      />

      {saved === "1" && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Profile saved.
        </div>
      )}

      <OrganizerProfileView profile={profile} />
    </>
  );
}
