import Link from "next/link";
import Image from "next/image";
import { FEATURED_CITIES } from "@/lib/data/cities";
import { getAllEvents, CITY_NAME_BY_SLUG } from "@/lib/data/events";

export async function CityGrid() {
  const events = await getAllEvents();
  const countByCity = (slug: string) => {
    const name = CITY_NAME_BY_SLUG[slug];
    return events.filter((e) => e.venue.city === name).length;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURED_CITIES.map((city) => {
        const eventCount = countByCity(city.slug);
        return (
          <Link
            key={city.slug}
            href={`/cities/${city.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-border"
          >
            <div className="relative aspect-[16/9]">
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-lg font-semibold">{city.name}</h3>
                <p className="text-sm text-muted">
                  {eventCount} upcoming show{eventCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
