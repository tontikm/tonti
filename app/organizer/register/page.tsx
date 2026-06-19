import { redirect } from "next/navigation";
import { OrganizerRegisterForm } from "@/components/organizer/OrganizerRegisterForm";
import { getOrganizerSession } from "@/lib/organizer/session";

export const metadata = {
  title: "Organizer register",
};

export default async function OrganizerRegisterPage() {
  const session = await getOrganizerSession();
  if (session) {
    redirect("/organizer");
  }

  return <OrganizerRegisterForm />;
}
