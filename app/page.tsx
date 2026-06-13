import Link from "next/link";
import { ArrowRight, Music2, Sparkles } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { GenreGrid } from "@/components/events/GenreGrid";
import { CityGrid } from "@/components/events/CityGrid";
import { Button } from "@/components/ui/Button";
import {
  getFeaturedEvents,
  getUpcomingEvents,
} from "@/lib/data/events";

export default function HomePage() {
  const featured = getFeaturedEvents();
  const thisWeekend = getUpcomingEvents(7);

  return (
    <>
      <section className="hero-glow relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent">
              <Music2 className="h-4 w-4" />
              Music events only
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your next{" "}
              <span className="gradient-text">unforgettable night</span>{" "}
              starts here
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Tonti is the ticketing platform built for live music. Discover
              concerts, club nights, and festivals — buy tickets in seconds.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/events" size="lg">
                Browse events
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/events?when=tonight" variant="secondary" size="lg">
                Tonight near you
              </Button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8 sm:max-w-lg">
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-muted">Shows listed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">40+</p>
              <p className="text-sm text-muted">Cities</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted">Non-music events</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wider">
                Featured
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Don&apos;t miss these shows
            </h2>
          </div>
          <Link
            href="/events"
            className="hidden text-sm text-muted transition-colors hover:text-accent sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 3).map((event, i) => (
            <EventCard key={event.slug} event={event} featured={i === 0} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Browse by genre</h2>
          <p className="mt-2 text-muted">
            From underground techno to stadium rock — find your sound.
          </p>
          <div className="mt-8">
            <GenreGrid />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">This week</h2>
            <p className="mt-2 text-muted">
              Shows happening in the next 7 days
            </p>
          </div>
          <Link
            href="/events?when=weekend"
            className="text-sm text-muted transition-colors hover:text-accent"
          >
            This weekend →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {thisWeekend.slice(0, 4).map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Explore cities</h2>
          <p className="mt-2 text-muted">
            Live music scenes across the country
          </p>
          <div className="mt-8">
            <CityGrid />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/10 via-surface to-surface p-8 sm:p-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Promoting a show?
            </h2>
            <p className="mt-3 text-muted">
              List your music event on Tonti. Set tiers, track sales, and scan
              tickets at the door — built for promoters, venues, and artists.
            </p>
            <Button href="/organizer" className="mt-6" size="lg">
              Start selling tickets
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
