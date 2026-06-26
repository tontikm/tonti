import { redirect } from "next/navigation";
import { ScannerShell } from "@/components/organizer/ScannerShell";
import { isScannerSession } from "@/lib/organizer/require-auth";
import { getOrganizerSession } from "@/lib/organizer/session";

export default async function ScanPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOrganizerSession();
  if (!session) {
    redirect("/organizer/login");
  }
  if (!isScannerSession(session)) {
    redirect("/organizer");
  }

  return <ScannerShell>{children}</ScannerShell>;
}
