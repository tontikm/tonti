"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import { toggleEventFollow } from "@/app/events/actions";
import type { Event } from "@/lib/types";
import { getSafeEventImageUrl } from "@/lib/images";
import { formatEventDate, formatEventTime } from "@/lib/utils";

type FollowedEventCardProps = {
  event: Event;
  badge?: string;
};

export function FollowedEventCard({ event, badge }: FollowedEventCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleUnfollow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await toggleEventFollow(event.slug);
      if (!result.error) {
        router.refresh();
      }
    });
  }

  const dateLabel = `${formatEventDate(event.date)} · ${formatEventTime(event.showTime)}`;
  const venueLabel = `${event.venue.name}, ${event.venue.city}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20">
      <div className="flex items-start gap-4">
        <Link href={`/events/${event.slug}`} className="shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10">
            <Image
              src={getSafeEventImageUrl(event.image)}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <Link
              href={`/events/${event.slug}`}
              className="truncate text-lg font-semibold hover:underline"
            >
              {event.title}
            </Link>
            {badge ? (
              <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                {badge}
              </span>
            ) : null}
          </div>
          <div className="mt-3 space-y-1.5 text-sm text-muted">
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              {dateLabel}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {venueLabel}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleUnfollow}
          disabled={pending}
          className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-muted transition-colors hover:border-white/30 hover:text-foreground disabled:opacity-60"
        >
          {pending ? "Removing…" : "Unfollow"}
        </button>
      </div>
    </div>
  );
}
