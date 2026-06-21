import { Suspense } from "react";
import { EventsPageContent } from "./EventsPageContent";
import { getPublicEvents } from "@/lib/data/events";

export const metadata = {
  title: "Browse Events",
  description: "Find live music events near you. Filter by category, city, and date.",
};

export default async function EventsPage() {
  const events = await getPublicEvents();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-muted sm:px-6 lg:px-8">
          Loading events…
        </div>
      }
    >
      <EventsPageContent events={events} />
    </Suspense>
  );
}
