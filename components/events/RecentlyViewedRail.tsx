"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/events/EventCard";
import { readRecentlyViewed } from "@/lib/recently-viewed";
import type { Event } from "@/lib/types";

export function RecentlyViewedRail({ events }: { events: Event[] }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readRecentlyViewed());
  }, []);

  const bySlug = new Map(events.map((event) => [event.slug, event]));
  const items = slugs
    .map((slug) => bySlug.get(slug))
    .filter((event): event is Event => Boolean(event));

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold sm:text-3xl">Recently viewed</h2>
      <p className="mt-2 text-muted">Pick up where you left off</p>
      <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((event) => (
          <div
            key={event.slug}
            className="w-[280px] shrink-0 snap-start sm:w-[320px]"
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </section>
  );
}
