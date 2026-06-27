import { cache } from "react";
import type { Event, EventCategory, Genre, Artist, Venue, TicketTier, EventPublicationStatus } from "@/lib/types";
import {
  isEventCategory,
  legacyGenreToCategory,
} from "@/lib/data/categories";
import { ALL_CITIES } from "@/lib/data/cities";
import { VENUES } from "@/lib/data/venues";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isPastEvent } from "@/lib/utils";
import { eventBelongsToOrganizer } from "@/lib/organizer/ownership";
import {
  getApprovedOrganizerIds,
  isEventPubliclyVisible,
} from "@/lib/admin/data";
import {
  formatSupabaseError,
  isConnectionError,
  isMissingColumnError,
} from "@/lib/supabase/errors";

let loggedEventsSeedFallback = false;
let loggedOrganizerMigrationHint = false;

function logEventsSeedFallback(reason: string): void {
  if (loggedEventsSeedFallback) return;
  loggedEventsSeedFallback = true;
  console.warn(`[Spotra] ${reason} Using local seed data from lib/data/events.ts.`);
}

function logOrganizerMigrationHint(): void {
  if (loggedOrganizerMigrationHint) return;
  loggedOrganizerMigrationHint = true;
  console.warn(
    "[Spotra] Organizer branding columns missing. Run supabase/migrations/0004_event_organizer_branding.sql in the Supabase SQL editor.",
  );
}

export const EVENTS: Event[] = [];

export const CITY_NAME_BY_SLUG: Record<string, string> = Object.fromEntries(
  ALL_CITIES.map((city) => [city.slug, city.name]),
);

function mapVenueRow(row: Record<string, unknown>): Venue {
  return {
    slug: row.slug as string,
    name: row.name as string,
    city: row.city as string,
    province: row.province as string,
    address: row.address as string,
    capacity: Number(row.capacity ?? 0),
    image: row.image as string,
  };
}

function mapArtistRow(row: Record<string, unknown>): Artist {
  return {
    slug: row.slug as string,
    name: row.name as string,
    genre: row.genre as Genre,
    image: row.image as string,
    bio: (row.bio as string) ?? undefined,
  };
}

function mapTierRow(row: Record<string, unknown>): TicketTier {
  return {
    id: row.id as string,
    name: row.name as string,
    price: Number(row.price ?? 0),
    description: (row.description as string) ?? undefined,
    capacity: Number(row.capacity ?? 0),
    sold: Number(row.sold ?? 0),
  };
}

type EventRow = Record<string, unknown> & {
  venue?: Record<string, unknown> | null;
  tiers?: Record<string, unknown>[] | null;
  event_artists?: { position?: number; artist: Record<string, unknown> }[] | null;
};

function mapEventCategory(row: EventRow): EventCategory {
  const raw = String(row.category ?? row.genre ?? "music");
  if (isEventCategory(raw)) return raw;
  return legacyGenreToCategory(raw);
}

function mapEventRow(row: EventRow): Event {
  const tiers = (row.tiers ?? [])
    .slice()
    .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
    .map(mapTierRow);

  const artists = (row.event_artists ?? [])
    .slice()
    .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
    .map((ea) => mapArtistRow(ea.artist));

  return {
    slug: row.slug as string,
    title: row.title as string,
    subtitle: (row.subtitle as string) ?? undefined,
    description: row.description as string,
    image: row.image as string,
    heroImage: (row.hero_image as string) ?? undefined,
    date: row.date as string,
    endDate: (row.end_date as string) ?? undefined,
    doorsTime: row.doors_time as string,
    showTime: row.show_time as string,
    category: mapEventCategory(row),
    featured: Boolean(row.featured),
    publicationStatus:
      (row.publication_status as EventPublicationStatus | undefined) ??
      "approved",
    artists,
    venue: row.venue ? mapVenueRow(row.venue) : VENUES[0],
    tiers,
    ageLimit: row.age_limit != null ? Number(row.age_limit) : undefined,
    ageMax: row.age_max != null ? Number(row.age_max) : undefined,
    tags: (row.tags as string[]) ?? [],
    organizerId: (row.organizer_id as string) ?? undefined,
    organizerName: (row.organizer_name as string) ?? undefined,
    organizerLogo: (row.organizer_logo as string) ?? undefined,
    showOrganizerProfile: Boolean(row.show_organizer_profile),
    prohibitedItems: (row.prohibited_items as string[]) ?? [],
    contactEmail: (row.contact_email as string) ?? undefined,
    refundPolicy: (row.refund_policy as string) ?? undefined,
  };
}

// Deduped per request: fetch from Supabase when configured, otherwise seed data.
const EVENTS_RELATIONS = `
  venue:venues(*),
  tiers:ticket_tiers(*),
  event_artists(position, artist:artists(*))`;

const EVENTS_CORE_COLUMNS = `
  slug, title, subtitle, description, image, hero_image, date, end_date, doors_time,
  show_time, genre, featured, age_limit, tags`;

const EVENTS_ORGANIZER_COLUMNS = `
  organizer_name, organizer_logo, organizer_id, prohibited_items, contact_email,
  refund_policy`;

const EVENTS_PUBLICATION_COLUMN = `publication_status`;

const EVENTS_SELECT_FULL = `
  ${EVENTS_CORE_COLUMNS}, ${EVENTS_PUBLICATION_COLUMN}, age_max, ${EVENTS_ORGANIZER_COLUMNS},
  show_organizer_profile,
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_WITHOUT_PUBLICATION = `
  ${EVENTS_CORE_COLUMNS}, age_max, ${EVENTS_ORGANIZER_COLUMNS},
  show_organizer_profile,
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_WITHOUT_AGE_MAX = `
  ${EVENTS_CORE_COLUMNS}, ${EVENTS_PUBLICATION_COLUMN}, ${EVENTS_ORGANIZER_COLUMNS},
  show_organizer_profile,
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_WITHOUT_SHOW_ORGANIZER = `
  ${EVENTS_CORE_COLUMNS}, ${EVENTS_PUBLICATION_COLUMN}, age_max, ${EVENTS_ORGANIZER_COLUMNS},
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_WITH_ORGANIZER = `
  ${EVENTS_CORE_COLUMNS}, ${EVENTS_PUBLICATION_COLUMN}, ${EVENTS_ORGANIZER_COLUMNS},
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_BASE = `
  ${EVENTS_CORE_COLUMNS}, ${EVENTS_PUBLICATION_COLUMN},
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_LEGACY_FULL = `
  ${EVENTS_CORE_COLUMNS}, age_max, ${EVENTS_ORGANIZER_COLUMNS},
  show_organizer_profile,
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_LEGACY_WITHOUT_AGE_MAX = `
  ${EVENTS_CORE_COLUMNS}, ${EVENTS_ORGANIZER_COLUMNS},
  show_organizer_profile,
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_LEGACY_WITHOUT_SHOW_ORGANIZER = `
  ${EVENTS_CORE_COLUMNS}, age_max, ${EVENTS_ORGANIZER_COLUMNS},
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_LEGACY_WITH_ORGANIZER = `
  ${EVENTS_CORE_COLUMNS}, ${EVENTS_ORGANIZER_COLUMNS},
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_LEGACY_BASE = `
  ${EVENTS_CORE_COLUMNS},
  ${EVENTS_RELATIONS}`;

const EVENT_SELECT_ATTEMPTS = [
  EVENTS_SELECT_FULL,
  EVENTS_SELECT_WITHOUT_AGE_MAX,
  EVENTS_SELECT_WITHOUT_SHOW_ORGANIZER,
  EVENTS_SELECT_WITH_ORGANIZER,
  EVENTS_SELECT_BASE,
  EVENTS_SELECT_WITHOUT_PUBLICATION,
  EVENTS_SELECT_LEGACY_FULL,
  EVENTS_SELECT_LEGACY_WITHOUT_AGE_MAX,
  EVENTS_SELECT_LEGACY_WITHOUT_SHOW_ORGANIZER,
  EVENTS_SELECT_LEGACY_WITH_ORGANIZER,
  EVENTS_SELECT_LEGACY_BASE,
] as const;

async function fetchEventRowsFromSupabase(
  supabase: NonNullable<ReturnType<typeof getSupabaseServer>>,
): Promise<{ rows: EventRow[] | null; error: unknown | null }> {
  let lastError: unknown = null;

  for (const select of EVENT_SELECT_ATTEMPTS) {
    const { data, error } = await supabase.from("events").select(select);
    if (!error) {
      return { rows: (data as unknown as EventRow[] | null) ?? null, error: null };
    }
    if (!isMissingColumnError(error)) {
      return { rows: null, error };
    }
    lastError = error;
  }

  return { rows: null, error: lastError };
}

const loadEvents = cache(async (): Promise<Event[]> => {
  const supabase = getSupabaseServer();
  if (!supabase) return EVENTS;

  const { rows, error } = await fetchEventRowsFromSupabase(supabase);

  if (error) {
    const reason = formatSupabaseError(error);
    if (isConnectionError(error)) {
      logEventsSeedFallback(
        `Cannot reach Supabase (${reason}). Check NEXT_PUBLIC_SUPABASE_URL in .env.local or remove Supabase env vars.`,
      );
    } else {
      logEventsSeedFallback(`Supabase events query failed (${reason}).`);
    }
    return EVENTS;
  }

  if (!rows) {
    logEventsSeedFallback("Supabase events query returned no data.");
    return EVENTS;
  }

  if (rows.length > 0 && rows[0] && !("organizer_id" in rows[0])) {
    logOrganizerMigrationHint();
  }

  return rows.map(mapEventRow);
});

export async function getAllEvents(): Promise<Event[]> {
  const events = await loadEvents();
  return [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
  const events = await loadEvents();
  return events.find((e) => e.slug === slug);
}

/** Load one event by slug from Supabase (for ticket/order pages). */
export async function getEventBySlugFromDb(
  slug: string,
): Promise<Event | undefined> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return getEventBySlug(slug);
  }

  for (const select of EVENT_SELECT_ATTEMPTS) {
    const { data, error } = await supabase
      .from("events")
      .select(select)
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      return mapEventRow(data as unknown as EventRow);
    }
    if (error && !isMissingColumnError(error)) {
      break;
    }
  }

  return getEventBySlug(slug);
}

async function filterPubliclyVisibleEvents(events: Event[]): Promise<Event[]> {
  const approvedOrganizerIds = await getApprovedOrganizerIds();
  return events.filter(
    (event) =>
      !isPastEvent(event) &&
      isEventPubliclyVisible(event, approvedOrganizerIds),
  );
}

/** Active events from approved organizers for fan-facing surfaces. */
export async function getPublicEvents(): Promise<Event[]> {
  const events = await getAllEvents();
  return filterPubliclyVisibleEvents(events);
}

/** Public event detail — returns undefined if hidden or ended. */
export async function getPublicEventBySlug(
  slug: string,
): Promise<Event | undefined> {
  const events = await getPublicEvents();
  return events.find((e) => e.slug === slug);
}

export async function getFeaturedEvents(): Promise<Event[]> {
  return (await getPublicEvents()).filter((e) => e.featured);
}

export async function getEventsByCategory(
  category: EventCategory,
): Promise<Event[]> {
  return (await getPublicEvents()).filter((e) => e.category === category);
}

export async function getEventsByOrganizerId(
  organizerId: string,
): Promise<Event[]> {
  const events = await getAllEvents();
  return events.filter((e) => e.organizerId === organizerId);
}

export async function getEventsForOrganizer(
  organizerId: string | undefined,
  organizerName: string | undefined,
  organizerEmail?: string | undefined,
): Promise<Event[]> {
  const identity = {
    id: organizerId,
    name: organizerName,
    email: organizerEmail,
  };

  if (!identity.id && !identity.name && !identity.email) {
    return [];
  }

  const events = await getAllEvents();
  return events.filter((event) => eventBelongsToOrganizer(event, identity));
}

export async function getEventsByCity(citySlug: string): Promise<Event[]> {
  const cityName = CITY_NAME_BY_SLUG[citySlug];
  if (!cityName) return [];
  return (await getPublicEvents()).filter((e) => e.venue.city === cityName);
}

export async function getEventsByArtist(artistSlug: string): Promise<Event[]> {
  return (await getPublicEvents()).filter((e) =>
    e.artists.some((a) => a.slug === artistSlug),
  );
}

export async function getEventsByVenue(venueSlug: string): Promise<Event[]> {
  return (await getPublicEvents()).filter((e) => e.venue.slug === venueSlug);
}

export async function getUpcomingEvents(days = 7): Promise<Event[]> {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return (await getPublicEvents()).filter((e) => {
    const d = new Date(e.date);
    return d >= now && d <= cutoff;
  });
}

export async function searchEvents(query: string): Promise<Event[]> {
  const q = query.toLowerCase().trim();
  const events = await getPublicEvents();
  if (!q) return events;
  return events.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.artists.some((a) => a.name.toLowerCase().includes(q)) ||
      e.venue.name.toLowerCase().includes(q) ||
      e.venue.city.toLowerCase().includes(q),
  );
}
