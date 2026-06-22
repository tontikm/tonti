import { redirect } from "next/navigation";
import { OrganizerShell } from "@/components/organizer/OrganizerShell";
import { OrganizerPendingBanner } from "@/components/organizer/OrganizerPendingBanner";
import { getOrganizerSession } from "@/lib/organizer/session";

export default async function OrganizerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOrganizerSession();
  if (!session) {
    redirect("/organizer/login");
  }

  return (
    <OrganizerShell session={session}>
      <OrganizerPendingBanner />
      {children}
    </OrganizerShell>
  );
}
