"use client";

import { useSearchParams } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { GENRES } from "@/lib/data/genres";
import { CITIES } from "@/lib/data/cities";
import { filterEvents, getUpcomingEvents } from "@/lib/data/events";
import { getGenreLabel } from "@/lib/data/genres";
import type { Genre } from "@/lib/types";
import Link from "next/link";

export function EventsPageContent() {
  const searchParams = useSearchParams();
  const genre = searchParams.get("genre") as Genre | null;
  const city = searchParams.get("city");
  const when = searchParams.get("when");
  const query = searchParams.get("q") ?? "";

  let events = filterEvents({
    genre: genre ?? undefined,
    city: city ?? undefined,
    query: query || undefined,
  });

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
    events = getUpcomingEvents(7).filter((e) =>
      genre ? e.genre === genre : true,
    );
  }

  const title = when === "tonight"
    ? "Tonight"
    : when === "weekend"
      ? "This Weekend"
      : genre
        ? getGenreLabel(genre)
        : city
          ? CITIES.find((c) => c.slug === city)?.name ?? "Events"
          : "All Events";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-muted">
          {events.length} upcoming music event{events.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterPill href="/events" active={!genre && !when && !city}>
          All
        </FilterPill>
        {GENRES.map((g) => (
          <FilterPill
            key={g.id}
            href={`/events?genre=${g.id}`}
            active={genre === g.id}
          >
            {g.label}
          </FilterPill>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterPill href="/events?when=tonight" active={when === "tonight"}>
          Tonight
        </FilterPill>
        <FilterPill href="/events?when=weekend" active={when === "weekend"}>
          This week
        </FilterPill>
        {CITIES.slice(0, 4).map((c) => (
          <FilterPill
            key={c.slug}
            href={`/events?city=${c.slug}`}
            active={city === c.slug}
          >
            {c.name}
          </FilterPill>
        ))}
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
          ? "border-accent bg-accent/10 text-accent"
          : "border-border text-muted hover:border-accent/40 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
