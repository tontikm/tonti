import { redirect } from "next/navigation";
import { OrganizerShell } from "@/components/organizer/OrganizerShell";
import { OrganizerPendingBanner } from "@/components/organizer/OrganizerPendingBanner";
import { isScannerSession } from "@/lib/organizer/require-auth";
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
  if (isScannerSession(session)) {
    redirect("/organizer/scan");
  }

  return (
    <OrganizerShell session={session}>
      <OrganizerPendingBanner />
      {children}
    </OrganizerShell>
  );
}
