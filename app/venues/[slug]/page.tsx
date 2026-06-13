import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { VENUES, getVenueBySlug } from "@/lib/data/venues";
import { getEventsByVenue } from "@/lib/data/events";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return VENUES.map((venue) => ({ slug: venue.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);
  if (!venue) return { title: "Venue not found" };
  return {
    title: venue.name,
    description: `Upcoming live music at ${venue.name} in ${venue.city}, ${venue.state}`,
  };
}

export default async function VenuePage({ params }: Props) {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);
  if (!venue) notFound();

  const events = getEventsByVenue(slug);

  return (
    <>
      <div className="relative h-48 overflow-hidden sm:h-64">
        <Image
          src={venue.image}
          alt={venue.name}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold sm:text-4xl">{venue.name}</h1>

        <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            {venue.address}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            Capacity: {venue.capacity.toLocaleString()}
          </span>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">
            Upcoming shows ({events.length})
          </h2>
          {events.length === 0 ? (
            <p className="mt-4 text-muted">No upcoming shows at this venue.</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-8">
          <Link href="/events" className="text-sm text-accent hover:underline">
            ← Browse all events
          </Link>
        </div>
      </div>
    </>
  );
}
