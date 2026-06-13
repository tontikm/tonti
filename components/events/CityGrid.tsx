import Link from "next/link";
import Image from "next/image";
import { CITIES } from "@/lib/data/cities";
import { getEventsByCity } from "@/lib/data/events";

export function CityGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CITIES.map((city) => {
        const eventCount = getEventsByCity(city.slug).length;
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
