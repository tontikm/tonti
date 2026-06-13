import { Suspense } from "react";
import { EventsPageContent } from "./EventsPageContent";

export const metadata = {
  title: "Browse Events",
  description: "Find live music events near you. Filter by genre, city, and date.",
};

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-muted sm:px-6 lg:px-8">
          Loading events…
        </div>
      }
    >
      <EventsPageContent />
    </Suspense>
  );
}
