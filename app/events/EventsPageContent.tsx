"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Map as MapIcon, Navigation, X } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { Reveal } from "@/components/ui/Reveal";
import { EVENT_CATEGORIES, getCategoryLabel } from "@/lib/data/categories";
import { ALL_CITIES, FEATURED_CITIES } from "@/lib/data/cities";
import { CITY_COORDS } from "@/lib/data/city-coords";
import { getLowestPrice, getTicketsRemaining } from "@/lib/utils";
import type { Event, EventCategory } from "@/lib/types";

const EventsMap = dynamic(
  () => import("@/components/events/EventsMap").then((m) => m.EventsMap),
  {
    ssr: false,
    loading: () => (
      <div className="skeleton h-[70vh] w-full rounded-2xl" />
    ),
  },
);

type SortKey = "soon" | "price-low" | "almost-gone";

function matchesQuery(event: Event, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    event.title.toLowerCase().includes(needle) ||
    event.artists.some((a) => a.name.toLowerCase().includes(needle)) ||
    event.venue.name.toLowerCase().includes(needle) ||
    event.venue.city.toLowerCase().includes(needle)
  );
}

function remainingRatio(event: Event): number {
  const totals = event.tiers.reduce(
    (acc, tier) => {
      acc.remaining += getTicketsRemaining(tier);
      acc.capacity += tier.capacity;
      return acc;
    },
    { remaining: 0, capacity: 0 },
  );
  if (totals.capacity === 0) return 1;
  return totals.remaining / totals.capacity;
}

type EventsPageContentProps = {
  events: Event[];
};

export function EventsPageContent({ events: allEvents }: EventsPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") as EventCategory | null;
  const city = searchParams.get("city");
  const when = searchParams.get("when");
  const query = searchParams.get("q") ?? "";
  const free = searchParams.get("free") === "1";

  const [view, setView] = useState<"grid" | "map">("grid");
  const [sort, setSort] = useState<SortKey>("soon");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  const priceCeiling = useMemo(() => {
    const prices = allEvents
      .map((e) => getLowestPrice(e.tiers) ?? 0)
      .filter((p) => p > 0);
    return prices.length ? Math.max(...prices) : 0;
  }, [allEvents]);

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

  if (maxPrice != null) {
    events = events.filter((e) => {
      const low = getLowestPrice(e.tiers);
      return low != null && low <= maxPrice;
    });
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

  events = [...events].sort((a, b) => {
    if (sort === "price-low") {
      return (getLowestPrice(a.tiers) ?? 0) - (getLowestPrice(b.tiers) ?? 0);
    }
    if (sort === "almost-gone") {
      return remainingRatio(a) - remainingRatio(b);
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  function buildHref(updates: Record<string, string | null>): string {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `/events?${qs}` : "/events";
  }

  function findNearestCity(lat: number, lng: number): string | null {
    let nearest: { slug: string; dist: number } | null = null;
    for (const cityItem of ALL_CITIES) {
      const coords = CITY_COORDS[cityItem.name];
      if (!coords) continue;
      const dist =
        (coords.lat - lat) ** 2 + (coords.lng - lng) ** 2;
      if (!nearest || dist < nearest.dist) {
        nearest = { slug: cityItem.slug, dist };
      }
    }
    return nearest?.slug ?? null;
  }

  function handleNearMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const slug = findNearestCity(
          position.coords.latitude,
          position.coords.longitude,
        );
        setLocating(false);
        if (slug) router.push(buildHref({ city: slug }));
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }

  const hasFilters = Boolean(
    category || city || when || query || free || maxPrice != null,
  );

  const activeChips: { label: string; onClear: () => void }[] = [];
  if (query)
    activeChips.push({
      label: `"${query}"`,
      onClear: () => router.push(buildHref({ q: null })),
    });
  if (category)
    activeChips.push({
      label: getCategoryLabel(category),
      onClear: () => router.push(buildHref({ category: null })),
    });
  if (city)
    activeChips.push({
      label: ALL_CITIES.find((c) => c.slug === city)?.name ?? city,
      onClear: () => router.push(buildHref({ city: null })),
    });
  if (when)
    activeChips.push({
      label: when === "tonight" ? "Tonight" : "This weekend",
      onClear: () => router.push(buildHref({ when: null })),
    });
  if (free)
    activeChips.push({
      label: "Free",
      onClear: () => router.push(buildHref({ free: null })),
    });
  if (maxPrice != null)
    activeChips.push({
      label: `Under R${maxPrice}`,
      onClear: () => setMaxPrice(null),
    });

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

      <div className="sticky top-16 z-30 -mx-4 mt-6 space-y-3 bg-background/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
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

          <button
            type="button"
            onClick={handleNearMe}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <Navigation className="h-3.5 w-3.5" />
            {locating ? "Locating…" : "Near me"}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort events"
              className="focus-ring rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
            >
              <option value="soon">Soonest</option>
              <option value="price-low">Cheapest</option>
              <option value="almost-gone">Almost gone</option>
            </select>

            <div className="inline-flex rounded-full border border-border p-0.5">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                aria-label="Grid view"
                className={`focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  view === "grid"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("map")}
                aria-pressed={view === "map"}
                aria-label="Map view"
                className={`focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  view === "map"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
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

        {priceCeiling > 0 && (
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="shrink-0">Max price</span>
            <input
              type="range"
              min={0}
              max={priceCeiling}
              step={50}
              value={maxPrice ?? priceCeiling}
              onChange={(e) => {
                const value = Number(e.target.value);
                setMaxPrice(value >= priceCeiling ? null : value);
              }}
              className="h-1 w-full max-w-xs cursor-pointer accent-[var(--brand)]"
              aria-label="Maximum ticket price"
            />
            <span className="w-20 shrink-0 font-mono text-foreground">
              {maxPrice != null ? `R${maxPrice}` : "Any"}
            </span>
          </div>
        )}

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.onClear}
                className="focus-ring inline-flex items-center gap-1 rounded-full bg-surface-hover px-3 py-1 text-xs text-foreground"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
            <Link
              href="/events"
              onClick={() => setMaxPrice(null)}
              className="text-xs text-muted underline hover:text-foreground"
            >
              Clear all
            </Link>
          </div>
        )}
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
      ) : view === "map" ? (
        <div className="mt-8">
          <EventsMap events={events} />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <Reveal key={event.slug} delay={Math.min(index, 8) * 0.03}>
              <EventCard event={event} />
            </Reveal>
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
      className={`focus-ring rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-foreground bg-accent text-accent-foreground"
          : "border-border text-muted hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
