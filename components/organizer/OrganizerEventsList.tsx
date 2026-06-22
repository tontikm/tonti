"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock, FileText, ImageOff, Pencil, Search, Ticket, Users } from "lucide-react";
import type { EventStatus } from "@/lib/utils";
import { formatDateRange, formatPrice } from "@/lib/utils";
import { getSafeEventImageUrl } from "@/lib/images";
import { OrganizerEventActions } from "@/components/organizer/OrganizerEventActions";

export type OrganizerEventListItem = {
  slug: string;
  title: string;
  image: string;
  hasImage: boolean;
  date: string;
  endDate?: string;
  showTime: string;
  venueCity: string;
  featured: boolean;
  status: EventStatus;
  ticketsIssued: number;
  capacity: number;
  revenue: number;
  lowestPrice: number | null;
};

type Tab = "current" | "past";

const STATUS_BADGE: Record<EventStatus, { label: string; className: string }> = {
  upcoming: {
    label: "Upcoming",
    className: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  },
  today: {
    label: "Today",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  },
  ended: {
    label: "Ended",
    className: "border-white/15 bg-white/5 text-muted",
  },
};

export function OrganizerEventsList({
  items,
  supabaseReady,
}: {
  items: OrganizerEventListItem[];
  supabaseReady: boolean;
}) {
  const [tab, setTab] = useState<Tab>("current");
  const [query, setQuery] = useState("");

  const currentItems = useMemo(
    () => items.filter((item) => item.status !== "ended"),
    [items],
  );
  const pastItems = useMemo(
    () => items.filter((item) => item.status === "ended"),
    [items],
  );

  const active = tab === "current" ? currentItems : pastItems;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return active;
    return active.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.venueCity.toLowerCase().includes(q),
    );
  }, [active, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your events"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none"
          />
        </div>

        <div className="inline-flex rounded-full border border-border bg-surface p-1 text-sm">
          <TabButton
            active={tab === "current"}
            onClick={() => setTab("current")}
            label="Current"
            count={currentItems.length}
          />
          <TabButton
            active={tab === "past"}
            onClick={() => setTab("past")}
            label="Past"
            count={pastItems.length}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-muted">
          {query.trim()
            ? "No events match your search."
            : tab === "current"
              ? "No current events."
              : "No past events yet."}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((item) => (
            <EventListRow
              key={item.slug}
              item={item}
              supabaseReady={supabaseReady}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted hover:text-foreground"
      }`}
    >
      {label}
      <span className={active ? "ml-1.5 opacity-70" : "ml-1.5 opacity-60"}>
        {count}
      </span>
    </button>
  );
}

function EventListRow({
  item,
  supabaseReady,
}: {
  item: OrganizerEventListItem;
  supabaseReady: boolean;
}) {
  const past = item.status === "ended";
  const badge = STATUS_BADGE[item.status];

  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 transition-colors hover:border-white/20 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={`/organizer/events/${item.slug}`}
          className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-surface sm:h-24 sm:w-40"
        >
          {item.hasImage ? (
            <Image
              src={getSafeEventImageUrl(item.image)}
              alt=""
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted">
              <ImageOff className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-wide">
                No image
              </span>
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/organizer/events/${item.slug}`}
              className="font-semibold hover:underline"
            >
              {item.title}
            </Link>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${badge.className}`}
            >
              {badge.label}
            </span>
            {item.featured && !past && (
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                Homepage
              </span>
            )}
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
            {formatDateRange(item.date, item.endDate)} · {item.venueCity}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-violet-400" />
              <span className="font-medium">{item.ticketsIssued}</span>
              <span className="text-muted">
                / {item.capacity > 0 ? item.capacity : "—"} issued
              </span>
            </span>
            <span className="font-mono font-medium">
              {formatPrice(item.revenue)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={
                past
                  ? `/organizer/events/${item.slug}/report`
                  : `/organizer/events/${item.slug}/tickets`
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/40"
            >
              {past ? (
                <>
                  <FileText className="h-3.5 w-3.5" />
                  Report
                </>
              ) : (
                <>
                  <Users className="h-3.5 w-3.5" />
                  Tickets
                </>
              )}
            </Link>
            <Link
              href={`/organizer/events/${item.slug}/edit`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
          <OrganizerEventActions
            slug={item.slug}
            supabaseReady={supabaseReady}
          />
        </div>
      </div>
    </li>
  );
}
