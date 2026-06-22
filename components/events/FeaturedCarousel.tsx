"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Event } from "@/lib/types";
import { getSafeEventImageUrl } from "@/lib/images";
import {
  formatDateRange,
  formatEventTime,
  getTicketsRemaining,
} from "@/lib/utils";

type FeaturedCarouselProps = {
  events: Event[];
};

const AUTOPLAY_MS = 6000;

export function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = events.length;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count, paused, next]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev]);

  if (count === 0) return null;

  return (
    <section
      className="bg-black pb-10 pt-3 sm:pb-12 sm:pt-4"
      aria-roledescription="carousel"
      aria-label="Featured events"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[4/5] max-h-[min(72vh,680px)] min-h-[320px] w-full overflow-hidden rounded-[28px] bg-black sm:aspect-[3/4] sm:rounded-[32px]">
          {events.map((event, index) => {
            const isActive = index === active;
            const soldOut = event.tiers.every(
              (t) => getTicketsRemaining(t) === 0,
            );
            const dateLine = event.endDate
              ? formatDateRange(event.date, event.endDate)
              : `${formatDateRange(event.date)} · ${formatEventTime(event.showTime)} SAST`;

            return (
              <div
                key={event.slug}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive
                    ? "z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                }`}
              >
                <Image
                  src={getSafeEventImageUrl(event.image)}
                  alt=""
                  fill
                  priority={index === 0}
                  className="carousel-photo object-contain object-center"
                  sizes="(max-width: 1440px) 100vw, 1440px"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
                <div className="carousel-bowl pointer-events-none absolute inset-x-0 bottom-0 h-[45%]" />

                <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-20 pt-16 sm:px-10 sm:pb-24 lg:px-12">
                  <div className="max-w-3xl">
                    {event.subtitle && (
                      <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-white/70 sm:text-base">
                        {event.subtitle}
                      </p>
                    )}

                    <h2 className="text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                      {event.title}
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                      {event.venue.name}, {event.venue.city} · {dateLine}
                    </p>

                    <div className="mt-6">
                      <Link
                        href={`/events/${event.slug}`}
                        className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                      >
                        {soldOut ? "View event" : "Get tickets"}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {count > 1 && (
            <>
              <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center gap-2 sm:bottom-6">
                {events.map((event, index) => (
                  <button
                    key={event.slug}
                    type="button"
                    aria-label={`Go to slide ${index + 1}: ${event.title}`}
                    aria-current={index === active ? "true" : undefined}
                    onClick={() => goTo(index)}
                    className={`rounded-full transition-all ${
                      index === active
                        ? "h-2.5 w-2.5 bg-white"
                        : "h-2.5 w-2.5 bg-white/35 hover:bg-white/55"
                    }`}
                  />
                ))}
              </div>

              <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 sm:bottom-6 sm:right-8">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/25 hover:text-white sm:h-11 sm:w-11"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-opacity hover:opacity-90 sm:h-11 sm:w-11"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
