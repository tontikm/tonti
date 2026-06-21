import { cache } from "react";
import type { Event, EventCategory, Genre, Artist, Venue, TicketTier } from "@/lib/types";
import {
  isEventCategory,
  legacyGenreToCategory,
} from "@/lib/data/categories";
import { ARTISTS } from "@/lib/data/artists";
import { ALL_CITIES } from "@/lib/data/cities";
import { VENUES } from "@/lib/data/venues";
import { EVENT_IMAGES } from "@/lib/data/event-images";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isPastEvent } from "@/lib/utils";
import { eventBelongsToOrganizer } from "@/lib/organizer/ownership";
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
  console.warn(`[Tonti] ${reason} Using local seed data from lib/data/events.ts.`);
}

function logOrganizerMigrationHint(): void {
  if (loggedOrganizerMigrationHint) return;
  loggedOrganizerMigrationHint = true;
  console.warn(
    "[Tonti] Organizer branding columns missing — run supabase/migrations/0004_event_organizer_branding.sql in the Supabase SQL editor.",
  );
}

function daysFromNow(days: number, hour = 20, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function doorsBeforeShow(showIso: string, minutes = 60): string {
  const d = new Date(showIso);
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
}

const SEED_ORGANIZER_LOGO =
  "https://images.unsplash.com/photo-1614680376573-df3480a0c6ff?w=400&q=80";

export const EVENTS: Event[] = [
  {
    slug: "amapiano-festival-jhb",
    title: "Amapiano Festival",
    subtitle: "Two days of log-drum heaven",
    description:
      "The biggest amapiano gathering in Gauteng returns to Constitution Hill for two days of the country's hottest piano acts, yanos all-stars, and surprise guests. Bring your dance moves.",
    image: EVENT_IMAGES["amapiano-festival-jhb"],
    date: daysFromNow(12, 14),
    endDate: daysFromNow(13, 23),
    doorsTime: doorsBeforeShow(daysFromNow(12, 14)),
    showTime: daysFromNow(12, 14),
    category: "festival",
    featured: true,
    artists: [ARTISTS[0], ARTISTS[5]],
    venue: VENUES[3],
    ageLimit: 18,
    tags: ["festival", "amapiano", "two-day"],
    organizerName: "Piano Nation SA",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "ga",
        name: "Weekend GA",
        price: 650,
        capacity: 3000,
        sold: 2140,
        description: "Access to both days, general standing",
      },
      {
        id: "vip",
        name: "Weekend VIP",
        price: 1500,
        capacity: 500,
        sold: 312,
        description: "Raised viewing deck, fast-track entry, cash bar",
      },
    ],
  },
  {
    slug: "tonti-sessions-free-fridays",
    title: "Tonti Sessions: Free Fridays",
    subtitle: "Free entry, all welcome",
    description:
      "Our weekly free showcase of rising SA talent at Constitution Hill. No ticket price — just RSVP and pull through for an evening of live music.",
    image: EVENT_IMAGES["tonti-sessions-free-fridays"],
    date: daysFromNow(4, 18),
    doorsTime: doorsBeforeShow(daysFromNow(4, 18)),
    showTime: daysFromNow(4, 18, 30),
    category: "nightlife",
    featured: false,
    artists: [ARTISTS[2]],
    venue: VENUES[3],
    tags: ["free", "showcase", "weekly"],
    organizerName: "Tonti Sessions",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "rsvp",
        name: "Free RSVP",
        price: 0,
        capacity: 800,
        sold: 540,
        description: "Free general admission — first come, first served",
      },
    ],
  },
  {
    slug: "nomvula-kirstenbosch",
    title: "Nomvula Live at Kirstenbosch",
    subtitle: "Sunset afro-house sessions",
    description:
      "Nomvula brings her spiritual afro-house show to the Kirstenbosch lawns for a magical sunset set surrounded by the gardens and Table Mountain.",
    image: EVENT_IMAGES["nomvula-kirstenbosch"],
    date: daysFromNow(6, 17, 30),
    doorsTime: doorsBeforeShow(daysFromNow(6, 17, 30), 90),
    showTime: daysFromNow(6, 17, 30),
    category: "music",
    featured: true,
    artists: [ARTISTS[1]],
    venue: VENUES[0],
    tags: ["outdoor", "afro-house", "sunset"],
    organizerName: "Kirstenbosch Live",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 350,
        capacity: 5000,
        sold: 3120,
      },
      {
        id: "picnic",
        name: "Picnic Spot",
        price: 850,
        capacity: 200,
        sold: 176,
        description: "Reserved lawn spot for up to 4 with picnic blanket",
      },
    ],
  },
  {
    slug: "deep-sankomota-grandwest",
    title: "Deep Sankomota — All Night House",
    description:
      "A marathon soulful house set from Deep Sankomota at the Grand Arena. Expect deep grooves from doors to last song.",
    image: EVENT_IMAGES["deep-sankomota-grandwest"],
    date: daysFromNow(20, 21),
    doorsTime: doorsBeforeShow(daysFromNow(20, 21)),
    showTime: daysFromNow(20, 22),
    category: "nightlife",
    featured: false,
    artists: [ARTISTS[2]],
    venue: VENUES[2],
    ageLimit: 18,
    tags: ["house", "all-night"],
    organizerName: "GrandWest Nights",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 250,
        capacity: 3500,
        sold: 1430,
      },
      {
        id: "vip",
        name: "VIP",
        price: 600,
        capacity: 300,
        sold: 122,
        description: "VIP balcony with private bar",
      },
    ],
  },
  {
    slug: "durban-bass-union-icc",
    title: "Durban Bass Union",
    subtitle: "Gqom takeover",
    description:
      "The sound of eThekwini takes over the Durban ICC Arena. Raw, hypnotic gqom built to move thousands.",
    image: EVENT_IMAGES["durban-bass-union-icc"],
    date: daysFromNow(3, 21),
    doorsTime: doorsBeforeShow(daysFromNow(3, 21)),
    showTime: daysFromNow(3, 22),
    category: "nightlife",
    featured: true,
    artists: [ARTISTS[3]],
    venue: VENUES[4],
    ageLimit: 18,
    tags: ["gqom", "durban", "late-night"],
    organizerName: "Durban Bass Union",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 200,
        capacity: 6000,
        sold: 5870,
      },
      {
        id: "golden",
        name: "Golden Circle",
        price: 450,
        capacity: 800,
        sold: 640,
        description: "Front standing area closest to the stage",
      },
    ],
  },
  {
    slug: "k1ng-verse-sun-arena",
    title: "K1NG Verse — Coronation Tour",
    description:
      "Joburg's sharpest lyricist headlines the Sun Arena with a full live band, special guests, and the whole catalogue.",
    image: EVENT_IMAGES["k1ng-verse-sun-arena"],
    date: daysFromNow(15, 20),
    doorsTime: doorsBeforeShow(daysFromNow(15, 20)),
    showTime: daysFromNow(15, 20, 30),
    category: "music",
    featured: false,
    artists: [ARTISTS[4]],
    venue: VENUES[1],
    ageLimit: 13,
    tags: ["hip-hop", "tour", "live-band"],
    organizerName: "Sun Arena Live",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 300,
        capacity: 6000,
        sold: 2210,
      },
      {
        id: "vip",
        name: "VIP Standing",
        price: 750,
        capacity: 500,
        sold: 198,
      },
    ],
  },
  {
    slug: "township-funk-con-hill",
    title: "Township Funk — Kwaito Classics",
    description:
      "A nostalgic night of golden-era kwaito at Constitution Hill. Sing along to every anthem with the originators of the bounce.",
    image: EVENT_IMAGES["township-funk-con-hill"],
    date: daysFromNow(9, 19),
    doorsTime: doorsBeforeShow(daysFromNow(9, 19)),
    showTime: daysFromNow(9, 20),
    category: "nightlife",
    featured: false,
    artists: [ARTISTS[5]],
    venue: VENUES[3],
    ageLimit: 18,
    tags: ["kwaito", "classics"],
    organizerName: "Con Hill Events",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 220,
        capacity: 3500,
        sold: 980,
      },
    ],
  },
  {
    slug: "lerato-sky-durban",
    title: "Lerato Sky Live",
    subtitle: "The Homecoming Show",
    description:
      "Afro-pop superstar Lerato Sky returns home to Durban for a sold-out-bound homecoming with her full live band and string section.",
    image: EVENT_IMAGES["lerato-sky-durban"],
    date: daysFromNow(2, 19, 30),
    doorsTime: doorsBeforeShow(daysFromNow(2, 19, 30)),
    showTime: daysFromNow(2, 20),
    category: "music",
    featured: true,
    artists: [ARTISTS[6]],
    venue: VENUES[4],
    tags: ["afro-pop", "live-band", "homecoming"],
    organizerName: "Skyline Promotions",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 400,
        capacity: 7000,
        sold: 6850,
      },
      {
        id: "vip",
        name: "VIP + Soundcheck",
        price: 1200,
        capacity: 150,
        sold: 150,
        description: "Soundcheck experience, VIP seating, merch pack",
      },
    ],
  },
  {
    slug: "cape-town-quartet-stellenbosch",
    title: "Cape Town Quartet",
    subtitle: "An evening of Cape jazz",
    description:
      "An intimate seated jazz evening at the Oude Libertas Amphitheatre under the Stellenbosch sky.",
    image: EVENT_IMAGES["cape-town-quartet-stellenbosch"],
    date: daysFromNow(24, 19),
    doorsTime: doorsBeforeShow(daysFromNow(24, 19)),
    showTime: daysFromNow(24, 19, 30),
    category: "music",
    featured: false,
    artists: [ARTISTS[7]],
    venue: VENUES[6],
    tags: ["jazz", "seated", "outdoor"],
    organizerName: "Oude Libertas Arts",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "ga",
        name: "Reserved Seating",
        price: 320,
        capacity: 430,
        sold: 210,
      },
    ],
  },
  {
    slug: "veld-riders-gqeberha",
    title: "Veld Riders — Loud at The Boardwalk",
    description:
      "High-octane SA rock hits the coast. Veld Riders bring the riffs to The Boardwalk in Gqeberha.",
    image: EVENT_IMAGES["veld-riders-gqeberha"],
    date: daysFromNow(28, 20),
    doorsTime: doorsBeforeShow(daysFromNow(28, 20)),
    showTime: daysFromNow(28, 20, 30),
    category: "music",
    featured: false,
    artists: [ARTISTS[8]],
    venue: VENUES[5],
    ageLimit: 16,
    tags: ["rock", "live-band"],
    organizerName: "Boardwalk Live",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 280,
        capacity: 2200,
        sold: 540,
      },
      {
        id: "pit",
        name: "Front Pit",
        price: 480,
        capacity: 300,
        sold: 96,
        description: "Front-of-stage standing pit",
      },
    ],
  },
  {
    slug: "naledi-pop-sun-arena",
    title: "Naledi — Starlight Tour",
    description:
      "Pop sensation Naledi lights up the Sun Arena with stadium-sized choruses, dancers, and a full production show.",
    image: EVENT_IMAGES["naledi-pop-sun-arena"],
    date: daysFromNow(1, 19),
    doorsTime: doorsBeforeShow(daysFromNow(1, 19)),
    showTime: daysFromNow(1, 20),
    category: "lifestyle",
    featured: true,
    artists: [ARTISTS[9]],
    venue: VENUES[1],
    tags: ["pop", "tour", "production"],
    organizerName: "Arena Pop Co.",
    organizerLogo: SEED_ORGANIZER_LOGO,
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 450,
        capacity: 8000,
        sold: 4120,
      },
      {
        id: "vip",
        name: "Golden Circle",
        price: 950,
        capacity: 600,
        sold: 410,
      },
    ],
  },
];

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
    date: row.date as string,
    endDate: (row.end_date as string) ?? undefined,
    doorsTime: row.doors_time as string,
    showTime: row.show_time as string,
    category: mapEventCategory(row),
    featured: Boolean(row.featured),
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
  slug, title, subtitle, description, image, date, end_date, doors_time,
  show_time, genre, featured, age_limit, tags`;

const EVENTS_ORGANIZER_COLUMNS = `
  organizer_name, organizer_logo, organizer_id, prohibited_items, contact_email,
  refund_policy`;

const EVENTS_SELECT_BASE = `
  ${EVENTS_CORE_COLUMNS},
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_WITH_ORGANIZER = `
  ${EVENTS_CORE_COLUMNS}, ${EVENTS_ORGANIZER_COLUMNS},
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_WITHOUT_AGE_MAX = `
  ${EVENTS_CORE_COLUMNS}, ${EVENTS_ORGANIZER_COLUMNS},
  show_organizer_profile,
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_WITHOUT_SHOW_ORGANIZER = `
  ${EVENTS_CORE_COLUMNS}, age_max, ${EVENTS_ORGANIZER_COLUMNS},
  ${EVENTS_RELATIONS}`;

const EVENTS_SELECT_FULL = `
  ${EVENTS_CORE_COLUMNS}, age_max, ${EVENTS_ORGANIZER_COLUMNS},
  show_organizer_profile,
  ${EVENTS_RELATIONS}`;

const EVENT_SELECT_ATTEMPTS = [
  EVENTS_SELECT_FULL,
  EVENTS_SELECT_WITHOUT_AGE_MAX,
  EVENTS_SELECT_WITHOUT_SHOW_ORGANIZER,
  EVENTS_SELECT_WITH_ORGANIZER,
  EVENTS_SELECT_BASE,
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

/** Active (non-ended) events for public/fan-facing surfaces. */
export async function getPublicEvents(): Promise<Event[]> {
  return (await getAllEvents()).filter((e) => !isPastEvent(e));
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
