import { FeaturedCarousel } from "@/components/events/FeaturedCarousel";
import { EventCard } from "@/components/events/EventCard";
import { EventRail } from "@/components/events/EventRail";
import { RecentlyViewedRail } from "@/components/events/RecentlyViewedRail";
import { ListYourEventCta } from "@/components/home/ListYourEventCta";
import { CategoryGrid } from "@/components/events/CategoryGrid";
import { CityGrid } from "@/components/events/CityGrid";
import { Reveal } from "@/components/ui/Reveal";
import {
  getPublicEvents,
} from "@/lib/data/events";
import { getHomepageCarouselSlides } from "@/lib/carousel/slides";
import { getFanUser } from "@/lib/auth/session";
import { getRecommendedEvents } from "@/lib/fan/recommendations";

export default async function HomePage() {
  const slides = await getHomepageCarouselSlides();
  const allEvents = await getPublicEvents();
  const fanUser = await getFanUser();
  const recommended = await getRecommendedEvents(fanUser);

  return (
    <>
      <FeaturedCarousel slides={slides} />

      <ListYourEventCta />

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
