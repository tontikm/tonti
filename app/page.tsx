import { FeaturedCarousel } from "@/components/events/FeaturedCarousel";
import { EventCard } from "@/components/events/EventCard";
import { EventRail } from "@/components/events/EventRail";
import { RecentlyViewedRail } from "@/components/events/RecentlyViewedRail";
import { CategoryGrid } from "@/components/events/CategoryGrid";
import { CityGrid } from "@/components/events/CityGrid";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  getPublicEvents,
  getFeaturedEvents,
} from "@/lib/data/events";
import { getFanUser } from "@/lib/auth/session";
import { getRecommendedEvents } from "@/lib/fan/recommendations";

export default async function HomePage() {
  const featured = await getFeaturedEvents();
  const allEvents = await getPublicEvents();
  const fanUser = await getFanUser();
  const recommended = await getRecommendedEvents(fanUser);

  return (
    <>
      <FeaturedCarousel events={featured} />

      {recommended.length > 0 && (
        <EventRail
          title="For you"
          subtitle="Based on shows you follow and have booked"
          events={recommended}
        />
      )}

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">All events</h2>
          <p className="mt-2 text-muted">
            {allEvents.length} upcoming show{allEvents.length !== 1 ? "s" : ""}{" "}
            across South Africa
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allEvents.map((event, index) => (
            <Reveal key={event.slug} delay={Math.min(index, 6) * 0.04}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>
      </section>

      <RecentlyViewedRail events={allEvents} />

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <Reveal className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-8 sm:p-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Promoting a show?
            </h2>
            <p className="mt-3 text-muted">
              List your music event on Spotra. Set tiers, track sales, and scan
              tickets at the door, built for SA promoters, venues, and artists.
            </p>
            <div className="mt-8">
              <Button href="/for-organizers" size="lg">
                Get started
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-white/10 bg-black">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Browse by category</h2>
          <p className="mt-2 text-muted">
            Nightlife, festivals, live music, and lifestyle events across SA.
          </p>
          <div className="mt-8">
            <CategoryGrid />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Explore cities</h2>
          <p className="mt-2 text-muted">
            Live music scenes across South Africa
          </p>
          <div className="mt-8">
            <CityGrid />
          </div>
        </div>
      </section>
    </>
  );
}
