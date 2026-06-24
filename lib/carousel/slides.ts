import { cache } from "react";
import type { Event, EventPublicationStatus } from "@/lib/types";
import { getApprovedOrganizerIds, isEventPubliclyVisible } from "@/lib/admin/data";
import { getEventBySlug } from "@/lib/data/events";
import { getSafeEventImageUrl } from "@/lib/images";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isMissingColumnError } from "@/lib/supabase/errors";
import { formatDateRange, formatEventTime, getTicketsRemaining, isPastEvent } from "@/lib/utils";

export type CarouselImageSource = "hero" | "poster" | "custom";
export type CarouselSlideType = "event" | "custom";

export type CarouselSlide = {
  id: string;
  mode: "hero" | "poster";
  imageUrl: string;
  title: string;
  subtitle?: string;
  metaLine?: string;
  href: string;
  ctaLabel: string;
  soldOut?: boolean;
};

export type AdminCarouselSlideRow = {
  id: string;
  sortOrder: number;
  slideType: CarouselSlideType;
  eventSlug: string | null;
  imageSource: CarouselImageSource | null;
  customImageUrl: string | null;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
  ctaLabel: string | null;
  active: boolean;
  eventTitle: string | null;
  eventPosterUrl: string | null;
  eventHeroUrl: string | null;
  isPubliclyVisible: boolean;
  warnings: string[];
};

type CarouselSlideDbRow = {
  id: string;
  sort_order: number;
  slide_type: CarouselSlideType;
  event_slug: string | null;
  image_source: CarouselImageSource | null;
  custom_image_url: string | null;
  title: string | null;
  subtitle: string | null;
  link_url: string | null;
  cta_label: string | null;
  active: boolean;
};

type EventImageRow = {
  slug: string;
  title: string;
  subtitle: string | null;
  image: string;
  hero_image: string | null;
  date: string;
  end_date: string | null;
  show_time: string;
  doors_time: string;
  organizer_id: string | null;
  publication_status: string | null;
  venue: { name: string; city: string } | null;
};

export function resolveEventSlideImage(
  event: Pick<Event, "image" | "heroImage">,
  imageSource: CarouselImageSource,
  customUrl: string | null,
): { mode: "hero" | "poster"; imageUrl: string } {
  if (imageSource === "custom" && customUrl) {
    return { mode: "hero", imageUrl: getSafeEventImageUrl(customUrl) };
  }

  if (imageSource === "hero" && event.heroImage) {
    return { mode: "hero", imageUrl: getSafeEventImageUrl(event.heroImage) };
  }

  if (imageSource === "poster" || imageSource === "hero") {
    return { mode: "poster", imageUrl: getSafeEventImageUrl(event.image) };
  }

  return { mode: "poster", imageUrl: getSafeEventImageUrl(event.image) };
}

function buildEventMetaLine(event: Event): string {
  const dateLine = event.endDate
    ? formatDateRange(event.date, event.endDate)
    : `${formatDateRange(event.date)} · ${formatEventTime(event.showTime)} SAST`;
  return `${event.venue.name}, ${event.venue.city} · ${dateLine}`;
}

function mapEventSlideToCarousel(
  row: CarouselSlideDbRow,
  event: Event,
): CarouselSlide | null {
  const imageSource = row.image_source ?? "poster";
  const { mode, imageUrl } = resolveEventSlideImage(
    event,
    imageSource,
    row.custom_image_url,
  );

  return {
    id: row.id,
    mode,
    imageUrl,
    title: row.title?.trim() || event.title,
    subtitle: row.subtitle?.trim() || event.subtitle,
    metaLine: buildEventMetaLine(event),
    href: `/events/${event.slug}`,
    ctaLabel: row.cta_label?.trim() || "Get tickets",
    soldOut: event.tiers.every((tier) => getTicketsRemaining(tier) === 0),
  };
}

function mapCustomSlideToCarousel(row: CarouselSlideDbRow): CarouselSlide | null {
  if (!row.custom_image_url) return null;

  const title = row.title?.trim();
  if (!title) return null;

  return {
    id: row.id,
    mode: "hero",
    imageUrl: getSafeEventImageUrl(row.custom_image_url),
    title,
    subtitle: row.subtitle?.trim() || undefined,
    href: row.link_url?.trim() || "#",
    ctaLabel: row.cta_label?.trim() || "Learn more",
  };
}

async function loadCarouselSlideRows(): Promise<CarouselSlideDbRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("homepage_carousel_slides")
    .select(
      "id, sort_order, slide_type, event_slug, image_source, custom_image_url, title, subtitle, link_url, cta_label, active",
    )
    .order("sort_order", { ascending: true });

  if (error) {
    if (isMissingColumnError(error)) return [];
    console.error("[Spotra] homepage_carousel_slides:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    sort_order: Number(row.sort_order ?? 0),
    slide_type: row.slide_type as CarouselSlideType,
    event_slug: (row.event_slug as string) ?? null,
    image_source: (row.image_source as CarouselImageSource) ?? null,
    custom_image_url: (row.custom_image_url as string) ?? null,
    title: (row.title as string) ?? null,
    subtitle: (row.subtitle as string) ?? null,
    link_url: (row.link_url as string) ?? null,
    cta_label: (row.cta_label as string) ?? null,
    active: Boolean(row.active),
  }));
}

export const getHomepageCarouselSlides = cache(
  async (): Promise<CarouselSlide[]> => {
    const rows = await loadCarouselSlideRows();
    const activeRows = rows.filter((row) => row.active);
    const approvedOrganizerIds = await getApprovedOrganizerIds();
    const slides: CarouselSlide[] = [];

    for (const row of activeRows) {
      if (row.slide_type === "custom") {
        const slide = mapCustomSlideToCarousel(row);
        if (slide && row.link_url?.trim()) slides.push(slide);
        continue;
      }

      if (!row.event_slug) continue;

      const event = await getEventBySlug(row.event_slug);
      if (!event || isPastEvent(event)) continue;
      if (
        !isEventPubliclyVisible(event, approvedOrganizerIds)
      ) {
        continue;
      }

      const slide = mapEventSlideToCarousel(row, event);
      if (slide) slides.push(slide);
    }

    return slides;
  },
);

function buildAdminWarnings(
  row: CarouselSlideDbRow,
  event: EventImageRow | null,
  isPubliclyVisible: boolean,
): string[] {
  const warnings: string[] = [];

  if (row.slide_type === "event") {
    if (!isPubliclyVisible) {
      warnings.push("Linked event is not publicly visible.");
    }
    if (row.image_source === "hero" && !event?.hero_image) {
      warnings.push("Organizer hero image missing — poster will be used on the homepage.");
    }
    if (row.image_source === "custom" && !row.custom_image_url) {
      warnings.push("Custom image not uploaded yet.");
    }
  }

  if (row.slide_type === "custom") {
    if (!row.title?.trim()) warnings.push("Title is required.");
    if (!row.link_url?.trim()) warnings.push("Link URL is required for the CTA.");
    if (!row.custom_image_url) warnings.push("Image is required.");
  }

  return warnings;
}

export async function listAdminCarouselSlides(): Promise<AdminCarouselSlideRow[]> {
  const rows = await loadCarouselSlideRows();
  if (rows.length === 0) return [];

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const eventSlugs = [
    ...new Set(
      rows
        .map((row) => row.event_slug)
        .filter((slug): slug is string => Boolean(slug)),
    ),
  ];

  const approvedOrganizerIds = await getApprovedOrganizerIds();
  const eventsBySlug = new Map<string, EventImageRow>();

  if (eventSlugs.length > 0) {
    const { data: events } = await supabase
      .from("events")
      .select(
        "slug, title, subtitle, image, hero_image, date, end_date, show_time, doors_time, organizer_id, publication_status, venue:venues(name, city)",
      )
      .in("slug", eventSlugs);

    for (const raw of events ?? []) {
      const venueRaw = raw.venue as
        | { name: string; city: string }
        | { name: string; city: string }[]
        | null;
      const venue = Array.isArray(venueRaw) ? venueRaw[0] ?? null : venueRaw;

      eventsBySlug.set(raw.slug as string, {
        slug: raw.slug as string,
        title: raw.title as string,
        subtitle: (raw.subtitle as string) ?? null,
        image: raw.image as string,
        hero_image: (raw.hero_image as string) ?? null,
        date: raw.date as string,
        end_date: (raw.end_date as string) ?? null,
        show_time: raw.show_time as string,
        doors_time: raw.doors_time as string,
        organizer_id: (raw.organizer_id as string) ?? null,
        publication_status: (raw.publication_status as string) ?? null,
        venue,
      });
    }
  }

  return rows.map((row) => {
    const event = row.event_slug ? eventsBySlug.get(row.event_slug) ?? null : null;
    const publicationStatus =
      (event?.publication_status as EventPublicationStatus | null) ?? "approved";
    const organizerId = event?.organizer_id ?? null;
    const isPubliclyVisible = event
      ? isEventPubliclyVisible(
          { organizerId, publicationStatus },
          approvedOrganizerIds,
        )
      : row.slide_type === "custom";

    return {
      id: row.id,
      sortOrder: row.sort_order,
      slideType: row.slide_type,
      eventSlug: row.event_slug,
      imageSource: row.image_source,
      customImageUrl: row.custom_image_url,
      title: row.title,
      subtitle: row.subtitle,
      linkUrl: row.link_url,
      ctaLabel: row.cta_label,
      active: row.active,
      eventTitle: event?.title ?? null,
      eventPosterUrl: event?.image ?? null,
      eventHeroUrl: event?.hero_image ?? null,
      isPubliclyVisible,
      warnings: buildAdminWarnings(row, event, isPubliclyVisible),
    };
  });
}

export async function listCarouselEventOptions(): Promise<
  Array<{
    slug: string;
    title: string;
    hasHero: boolean;
    isPubliclyVisible: boolean;
  }>
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const approvedOrganizerIds = await getApprovedOrganizerIds();
  const { data: events, error } = await supabase
    .from("events")
    .select("slug, title, hero_image, organizer_id, publication_status")
    .order("date", { ascending: true });

  if (error || !events) return [];

  return events.map((row) => {
    const organizerId = (row.organizer_id as string) ?? null;
    const publicationStatus =
      (row.publication_status as EventPublicationStatus | null) ?? "approved";
    return {
      slug: row.slug as string,
      title: row.title as string,
      hasHero: Boolean(row.hero_image),
      isPubliclyVisible: isEventPubliclyVisible(
        { organizerId, publicationStatus },
        approvedOrganizerIds,
      ),
    };
  });
}

export async function getNextCarouselSortOrder(): Promise<number> {
  const rows = await loadCarouselSlideRows();
  if (rows.length === 0) return 0;
  return Math.max(...rows.map((row) => row.sort_order)) + 1;
}
