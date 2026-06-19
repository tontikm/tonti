import { redirect } from "next/navigation";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { OrganizerProfileForm } from "@/components/organizer/OrganizerProfileForm";
import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { getOrganizerSession } from "@/lib/organizer/session";

export const metadata = {
  title: "Edit profile",
};

export default async function EditOrganizerProfilePage() {
  const session = await getOrganizerSession();
  if (!session) redirect("/organizer/login");

  const profile = await getOrganizerByEmail(session.email);
  if (!profile) redirect("/organizer/profile");

  return (
    <>
      <OrganizerPageHeader
        title="Edit profile"
        description="Update your public page, contact details, and billing information."
      />
      <OrganizerProfileForm profile={profile} />
    </>
  );
}
