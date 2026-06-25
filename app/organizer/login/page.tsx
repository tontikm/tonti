import { OrganizerLoginForm } from "@/components/organizer/OrganizerLoginForm";
import { getOrganizerSession } from "@/lib/organizer/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Organizer login",
};

type OrganizerLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrganizerLoginPage({
  searchParams,
}: OrganizerLoginPageProps) {
  const session = await getOrganizerSession();
  if (session) {
    redirect("/organizer");
  }

  const query = await searchParams;
  const idleLogout = query.reason === "idle";
  const passwordReset = query.reset === "1";

  return <OrganizerLoginForm idleLogout={idleLogout} passwordReset={passwordReset} />;
}
