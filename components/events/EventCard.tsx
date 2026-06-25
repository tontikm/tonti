"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { MapPin, Calendar } from "lucide-react";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { getCategoryColor, getCategoryLabel } from "@/lib/data/categories";
import { getSafeEventImageUrl } from "@/lib/images";
import {
  availabilityLabel,
  formatDateRange,
  formatEventTime,
  formatPrice,
  getEventAvailability,
  getLowestPrice,
} from "@/lib/utils";

type EventCardProps = {
  event: Event;
  featured?: boolean;
};

export function EventCard({ event, featured = false }: EventCardProps) {
  const reduceMotion = useReducedMotion();
  const lowestPrice = getLowestPrice(event.tiers);
  const availability = getEventAvailability(event.tiers);

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="h-full"
    >
      <Link
        href={`/events/${event.slug}`}
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow] duration-300 hover:border-brand/40 hover:shadow-[var(--shadow-2)] focus-ring ${
          featured ? "sm:col-span-2 sm:grid sm:grid-cols-2" : ""
        }`}
      >
        <div
          className={`relative overflow-hidden ${featured ? "aspect-[4/3] sm:aspect-auto sm:min-h-[280px]" : "aspect-[4/3]"}`}
        >
          <Image
            src={getSafeEventImageUrl(event.image)}
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
            <Badge color={getCategoryColor(event.category)}>
              {getCategoryLabel(event.category)}
            </Badge>
            {availability === "sold-out" && (
              <Badge className="border border-white/30 bg-black/70 text-white">
                Sold out
              </Badge>
            )}
            {availability === "limited" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                </span>
                Almost gone
              </span>
            )}
          </div>

          {lowestPrice !== null && availability !== "sold-out" && (
            <div className="absolute bottom-3 right-3 rounded-md border border-white/15 bg-black/70 px-2.5 py-1 font-mono text-sm font-semibold backdrop-blur-sm">
              {lowestPrice === 0 ? (
                <span className="text-brand">Free</span>
              ) : (
                <>
                  <span className="text-white/75">From </span>
                  <span className="text-brand">{formatPrice(lowestPrice)}</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className={`p-4 ${featured ? "flex flex-col justify-center" : ""}`}>
          <h3
            className={`font-semibold leading-snug transition-colors group-hover:text-brand ${featured ? "text-xl sm:text-2xl" : "text-base"}`}
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
                {event.endDate
                  ? formatDateRange(event.date, event.endDate)
                  : `${formatDateRange(event.date)} · ${formatEventTime(event.showTime)}`}
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

          <p
            className={`mt-3 text-xs font-medium ${
              availability === "sold-out"
                ? "text-red-400"
                : availability === "limited"
                  ? "text-brand"
                  : "text-emerald-400"
            }`}
          >
            {availabilityLabel(availability)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
