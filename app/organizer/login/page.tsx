import { OrganizerLoginForm } from "@/components/organizer/OrganizerLoginForm";
import { getOrganizerSession } from "@/lib/organizer/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Organizer login",
};

export default async function OrganizerLoginPage() {
  const session = await getOrganizerSession();
  if (session) {
    redirect("/organizer");
  }

  return <OrganizerLoginForm />;
}
