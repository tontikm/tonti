import { redirect } from "next/navigation";
import { OrganizerLanding } from "@/components/organizer/OrganizerLanding";
import { getFeaturedEvents, getAllEvents } from "@/lib/data/events";
import { getOrganizerSession } from "@/lib/organizer/session";

export const metadata = {
  title: "For organizers",
  description:
    "List events, sell tickets, and scan guests at the door with Spotra, built for SA promoters, venues, and artists.",
};

export default async function ForOrganizersPage() {
  const session = await getOrganizerSession();
  if (session) {
    redirect("/organizer");
  }

  const featured = await getFeaturedEvents();
  const fallback = featured.length > 0 ? featured : await getAllEvents();
  const heroEvents = fallback.slice(0, 4).map((event) => ({
    title: event.title,
    image: event.image,
  }));

  return <OrganizerLanding heroEvents={heroEvents} />;
}
