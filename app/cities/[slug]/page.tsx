import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { ALL_CITIES, getCityBySlug } from "@/lib/data/cities";
import { getEventsByCity } from "@/lib/data/events";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return ALL_CITIES.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "City not found" };
  return {
    title: `${city.name} Live Music`,
    description: `Discover live music events in ${city.name}, ${city.province}`,
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const events = await getEventsByCity(slug);

  return (
    <>
      <div className="relative h-48 overflow-hidden sm:h-72">
        <Image
          src={city.image}
          alt={city.name}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Live music in {city.name}
          </h1>
          <p className="mt-2 text-muted">
            {events.length} upcoming show{events.length !== 1 ? "s" : ""} in{" "}
            {city.province}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {events.length === 0 ? (
          <p className="text-muted">No upcoming shows in this city yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/events" className="text-sm text-accent hover:underline">
            ← Browse all events
          </Link>
        </div>
      </div>
    </>
  );
}
