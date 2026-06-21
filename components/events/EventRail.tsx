import { EventCard } from "@/components/events/EventCard";
import type { Event } from "@/lib/types";

type EventRailProps = {
  title: string;
  subtitle?: string;
  events: Event[];
};

export function EventRail({ title, subtitle, events }: EventRailProps) {
  if (events.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {events.map((event) => (
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
