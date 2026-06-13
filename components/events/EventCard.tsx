import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { getGenreColor, getGenreLabel } from "@/lib/data/genres";
import {
  formatEventDate,
  formatEventTime,
  formatPrice,
  getLowestPrice,
  getTicketsRemaining,
} from "@/lib/utils";

type EventCardProps = {
  event: Event;
  featured?: boolean;
};

export function EventCard({ event, featured = false }: EventCardProps) {
  const lowestPrice = getLowestPrice(event.tiers);
  const soldOut = event.tiers.every((t) => getTicketsRemaining(t) === 0);
  const almostGone = event.tiers.some(
    (t) =>
      getTicketsRemaining(t) > 0 &&
      getTicketsRemaining(t) / t.capacity < 0.15,
  );

  return (
    <Link
      href={`/events/${event.slug}`}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 ${
        featured ? "sm:col-span-2 sm:grid sm:grid-cols-2" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden ${featured ? "aspect-[4/3] sm:aspect-auto sm:min-h-[280px]" : "aspect-[4/3]"}`}
      >
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={
            featured
              ? "(max-width: 640px) 100vw, 50vw"
              : "(max-width: 640px) 100vw, 33vw"
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge color={getGenreColor(event.genre)}>
            {getGenreLabel(event.genre)}
          </Badge>
          {soldOut && (
            <Badge className="border border-red-500/40 bg-red-500/20 text-red-400">
              Sold out
            </Badge>
          )}
          {!soldOut && almostGone && (
            <Badge className="border border-amber-500/40 bg-amber-500/20 text-amber-400">
              Almost gone
            </Badge>
          )}
        </div>

        {lowestPrice !== null && !soldOut && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-sm font-semibold backdrop-blur-sm">
            From {formatPrice(lowestPrice)}
          </div>
        )}
      </div>

      <div className={`p-4 ${featured ? "flex flex-col justify-center" : ""}`}>
        <h3
          className={`font-semibold leading-snug group-hover:text-accent ${featured ? "text-xl sm:text-2xl" : "text-base"}`}
        >
          {event.title}
        </h3>
        {event.subtitle && (
          <p className="mt-1 text-sm text-muted">{event.subtitle}</p>
        )}

        <div className="mt-3 space-y-1.5 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatEventDate(event.date)} · {formatEventTime(event.showTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              {event.venue.name}, {event.venue.city}
            </span>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted/80">
          {event.artists.map((a) => a.name).join(", ")}
        </p>
      </div>
    </Link>
  );
}
