"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { EVENT_CATEGORIES, getCategoryLabel } from "@/lib/data/categories";
import { ALL_CITIES, FEATURED_CITIES } from "@/lib/data/cities";
import type { Event, EventCategory } from "@/lib/types";

function matchesQuery(event: Event, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    event.title.toLowerCase().includes(needle) ||
    event.artists.some((a) => a.name.toLowerCase().includes(needle)) ||
    event.venue.name.toLowerCase().includes(needle) ||
    event.venue.city.toLowerCase().includes(needle)
  );
}

type EventsPageContentProps = {
  events: Event[];
};

export function EventsPageContent({ events: allEvents }: EventsPageContentProps) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") as EventCategory | null;
  const city = searchParams.get("city");
  const when = searchParams.get("when");
  const query = searchParams.get("q") ?? "";
  const free = searchParams.get("free") === "1";

  let events = allEvents;

  if (category) events = events.filter((e) => e.category === category);

  if (city) {
    const cityName = ALL_CITIES.find((c) => c.slug === city)?.name;
    events = cityName ? events.filter((e) => e.venue.city === cityName) : [];
  }

  if (query) events = events.filter((e) => matchesQuery(e, query));

  if (free) {
    events = events.filter((e) => e.tiers.some((t) => t.price === 0));
  }

  if (when === "tonight") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    events = events.filter((e) => {
      const d = new Date(e.date);
      return d >= today && d < tomorrow;
    });
  } else if (when === "weekend") {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 7);
    events = events.filter((e) => {
      const d = new Date(e.date);
      return d >= now && d <= cutoff;
    });
  }

  function buildHref(updates: Record<string, string | null>): string {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `/events?${qs}` : "/events";
  }

  const hasFilters = Boolean(category || city || when || query || free);

  const title =
    when === "tonight"
      ? "Tonight"
      : when === "weekend"
        ? "This Weekend"
        : query
          ? `Results for "${query}"`
          : category
            ? getCategoryLabel(category)
            : city
              ? (ALL_CITIES.find((c) => c.slug === city)?.name ?? "Events")
              : "All Events";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-muted">
          {events.length} upcoming music event{events.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex flex-wrap gap-2">
          <FilterPill href="/events" active={!hasFilters}>
            All
          </FilterPill>
          <FilterPill
            href={buildHref({ when: when === "tonight" ? null : "tonight" })}
            active={when === "tonight"}
          >
            Tonight
          </FilterPill>
          <FilterPill
            href={buildHref({ when: when === "weekend" ? null : "weekend" })}
            active={when === "weekend"}
          >
            This weekend
          </FilterPill>
          <FilterPill
            href={buildHref({ free: free ? null : "1" })}
            active={free}
          >
            Free
          </FilterPill>
        </div>

        <div className="flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((item) => (
            <FilterPill
              key={item.id}
              href={buildHref({ category: category === item.id ? null : item.id })}
              active={category === item.id}
            >
              {item.label}
            </FilterPill>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {FEATURED_CITIES.map((c) => (
            <FilterPill
              key={c.slug}
              href={buildHref({ city: city === c.slug ? null : c.slug })}
              active={city === c.slug}
            >
              {c.name}
            </FilterPill>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-muted">No events match your filters.</p>
          <Link
            href="/events"
            className="mt-4 inline-block text-accent hover:underline"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-foreground bg-accent text-accent-foreground"
          : "border-border text-muted hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
