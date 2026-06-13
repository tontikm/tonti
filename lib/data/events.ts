import type { Event, Genre } from "@/lib/types";
import { ARTISTS } from "@/lib/data/artists";
import { VENUES } from "@/lib/data/venues";

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

export const EVENTS: Event[] = [
  {
    slug: "neon-pulse-live-la",
    title: "Neon Pulse Live",
    subtitle: "North America Tour 2026",
    description:
      "Experience Neon Pulse's most ambitious live show yet — a two-hour journey through deep techno, ambient breakdowns, and peak-time bangers. Featuring a custom LED rig and live modular synthesis.",
    image:
      "https://images.unsplash.com/photo-1571266028243-e68fdf784baf?w=1200&q=80",
    date: daysFromNow(5),
    doorsTime: doorsBeforeShow(daysFromNow(5)),
    showTime: daysFromNow(5),
    genre: "electronic",
    featured: true,
    artists: [ARTISTS[0]],
    venue: VENUES[0],
    ageLimit: 18,
    tags: ["live", "tour", "techno"],
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 45,
        capacity: 2000,
        sold: 1420,
        description: "Standing room on the main floor",
      },
      {
        id: "vip",
        name: "VIP",
        price: 95,
        capacity: 300,
        sold: 187,
        description: "Front section + exclusive merch pack",
      },
    ],
  },
  {
    slug: "maya-rivers-intimate-nyc",
    title: "Maya Rivers — Intimate Sessions",
    description:
      "An stripped-down evening with Maya Rivers performing songs from her latest album plus unreleased material. Limited capacity for an up-close soul experience.",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    date: daysFromNow(8),
    doorsTime: doorsBeforeShow(daysFromNow(8, 19)),
    showTime: daysFromNow(8, 19, 30),
    genre: "r-and-b",
    featured: true,
    artists: [ARTISTS[1]],
    venue: VENUES[1],
    ageLimit: 21,
    tags: ["intimate", "soul", "live-band"],
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 55,
        capacity: 800,
        sold: 612,
      },
      {
        id: "meet",
        name: "Meet & Greet",
        price: 150,
        capacity: 50,
        sold: 48,
        description: "Post-show photo + signed poster",
      },
    ],
  },
  {
    slug: "midnight-collective-austin",
    title: "The Midnight Collective",
    subtitle: "With special guest Luna Echo",
    description:
      "Dream-pop night at The Mohawk with full light show. The Midnight Collective brings their signature wall of sound to Austin for one night only.",
    image:
      "https://images.unsplash.com/photo-1459745456775-9afc3a8049bc?w=1200&q=80",
    date: daysFromNow(12),
    doorsTime: doorsBeforeShow(daysFromNow(12, 20)),
    showTime: daysFromNow(12, 20),
    genre: "indie",
    featured: true,
    artists: [ARTISTS[2]],
    venue: VENUES[3],
    ageLimit: 18,
    tags: ["indie", "dream-pop"],
    tiers: [
      {
        id: "early",
        name: "Early Bird",
        price: 28,
        capacity: 200,
        sold: 200,
        description: "Sold out tier — join waitlist",
      },
      {
        id: "ga",
        name: "General Admission",
        price: 35,
        capacity: 1000,
        sold: 743,
      },
    ],
  },
  {
    slug: "kairo-hip-hop-night-miami",
    title: "Kairo Presents: Hip-Hop Night",
    description:
      "DJ Kairo curates a night of underground hip-hop with live MCs, beat battles, and surprise guest performances. Miami's hottest hip-hop party returns.",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
    date: daysFromNow(3),
    doorsTime: doorsBeforeShow(daysFromNow(3, 22)),
    showTime: daysFromNow(3, 23),
    genre: "hip-hop",
    featured: false,
    artists: [ARTISTS[3]],
    venue: VENUES[2],
    ageLimit: 21,
    tags: ["hip-hop", "club", "late-night"],
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 30,
        capacity: 600,
        sold: 421,
      },
      {
        id: "vip",
        name: "VIP Table",
        price: 200,
        capacity: 20,
        sold: 14,
        description: "Reserved table for 4 + bottle service credit",
      },
    ],
  },
  {
    slug: "solar-flare-chicago",
    title: "Solar Flare — Rock the Metro",
    description:
      "Solar Flare brings their explosive live show to Metro Hall. Expect crowd surfing, extended jams, and a setlist packed with hits and deep cuts.",
    image:
      "https://images.unsplash.com/photo-1506157782851-9777a7f546ce?w=1200&q=80",
    date: daysFromNow(18),
    doorsTime: doorsBeforeShow(daysFromNow(18, 19)),
    showTime: daysFromNow(18, 19, 30),
    genre: "rock",
    featured: false,
    artists: [ARTISTS[4]],
    venue: VENUES[4],
    ageLimit: 18,
    tags: ["rock", "live-band"],
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 40,
        capacity: 2200,
        sold: 890,
      },
      {
        id: "pit",
        name: "Pit Access",
        price: 65,
        capacity: 400,
        sold: 312,
        description: "Front-of-stage standing area",
      },
    ],
  },
  {
    slug: "carla-mendez-miami-beach",
    title: "Carla Mendez — Caliente Tour",
    subtitle: "Outdoor beach stage",
    description:
      "Carla Mendez takes over Pulse Club's outdoor stage for a night of reggaeton, Latin pop, and high-energy choreography under the Miami stars.",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80",
    date: daysFromNow(1),
    doorsTime: doorsBeforeShow(daysFromNow(1, 21)),
    showTime: daysFromNow(1, 22),
    genre: "latin",
    featured: true,
    artists: [ARTISTS[5]],
    venue: VENUES[2],
    ageLimit: 21,
    tags: ["latin", "reggaeton", "outdoor"],
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 50,
        capacity: 500,
        sold: 467,
      },
      {
        id: "vip",
        name: "VIP Lounge",
        price: 120,
        capacity: 100,
        sold: 89,
      },
    ],
  },
  {
    slug: "blue-hour-jazz-chicago",
    title: "Blue Hour Quartet — Jazz Night",
    description:
      "An evening of contemporary jazz at Metro Hall. The Blue Hour Quartet performs material from their acclaimed album plus improvisational suites.",
    image:
      "https://images.unsplash.com/photo-1415201364774-f6f0ff5a0287?w=1200&q=80",
    date: daysFromNow(25),
    doorsTime: doorsBeforeShow(daysFromNow(25, 19)),
    showTime: daysFromNow(25, 19, 30),
    genre: "jazz",
    featured: false,
    artists: [ARTISTS[6]],
    venue: VENUES[4],
    tags: ["jazz", "seated"],
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 38,
        capacity: 1500,
        sold: 234,
      },
      {
        id: "reserved",
        name: "Reserved Seating",
        price: 55,
        capacity: 400,
        sold: 89,
      },
    ],
  },
  {
    slug: "dusty-trails-nashville",
    title: "Dusty Trails — Honky Tonk Heart",
    description:
      "Nashville's favorite outlaw country band returns to Ryman Stage for a night of storytelling, twang, and sing-alongs.",
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&q=80",
    date: daysFromNow(30),
    doorsTime: doorsBeforeShow(daysFromNow(30, 19)),
    showTime: daysFromNow(30, 19, 30),
    genre: "country",
    featured: false,
    artists: [ARTISTS[7]],
    venue: VENUES[5],
    ageLimit: 18,
    tags: ["country", "nashville"],
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 42,
        capacity: 1800,
        sold: 456,
      },
      {
        id: "premium",
        name: "Premium",
        price: 75,
        capacity: 400,
        sold: 123,
        description: "Elevated seating with better sightlines",
      },
    ],
  },
  {
    slug: "warehouse-rave-nyc",
    title: "Warehouse Rave: All Night",
    subtitle: "Neon Pulse + guest DJs",
    description:
      "Underground electronic marathon at Warehouse 9. Three rooms, six DJs, sunrise set. The definitive NYC warehouse experience.",
    image:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429da7?w=1200&q=80",
    date: daysFromNow(14),
    doorsTime: doorsBeforeShow(daysFromNow(14, 22)),
    showTime: daysFromNow(14, 23),
    genre: "electronic",
    featured: false,
    artists: [ARTISTS[0]],
    venue: VENUES[1],
    ageLimit: 21,
    tags: ["rave", "warehouse", "all-night"],
    tiers: [
      {
        id: "ga",
        name: "General Admission",
        price: 35,
        capacity: 900,
        sold: 678,
      },
    ],
  },
];

export function getAllEvents(): Event[] {
  return [...EVENTS].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export function getEventBySlug(slug: string): Event | undefined {
  return EVENTS.find((e) => e.slug === slug);
}

export function getFeaturedEvents(): Event[] {
  return getAllEvents().filter((e) => e.featured);
}

export function getEventsByGenre(genre: Genre): Event[] {
  return getAllEvents().filter((e) => e.genre === genre);
}

export function getEventsByCity(citySlug: string): Event[] {
  const cityMap: Record<string, string[]> = {
    "los-angeles": ["Los Angeles"],
    "new-york": ["Brooklyn", "New York"],
    miami: ["Miami", "Miami Beach"],
    austin: ["Austin"],
    chicago: ["Chicago"],
    nashville: ["Nashville"],
  };
  const cities = cityMap[citySlug] ?? [];
  return getAllEvents().filter((e) => cities.includes(e.venue.city));
}

export function getEventsByArtist(artistSlug: string): Event[] {
  return getAllEvents().filter((e) =>
    e.artists.some((a) => a.slug === artistSlug),
  );
}

export function getEventsByVenue(venueSlug: string): Event[] {
  return getAllEvents().filter((e) => e.venue.slug === venueSlug);
}

export function getUpcomingEvents(days = 7): Event[] {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return getAllEvents().filter((e) => {
    const d = new Date(e.date);
    return d >= now && d <= cutoff;
  });
}

export function searchEvents(query: string): Event[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllEvents();
  return getAllEvents().filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.artists.some((a) => a.name.toLowerCase().includes(q)) ||
      e.venue.name.toLowerCase().includes(q) ||
      e.venue.city.toLowerCase().includes(q),
  );
}

export type EventFilters = {
  genre?: Genre;
  city?: string;
  query?: string;
};

export function filterEvents(filters: EventFilters): Event[] {
  let results = getAllEvents();

  if (filters.genre) {
    results = results.filter((e) => e.genre === filters.genre);
  }

  if (filters.city) {
    results = getEventsByCity(filters.city).filter((e) =>
      filters.genre ? e.genre === filters.genre : true,
    );
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.artists.some((a) => a.name.toLowerCase().includes(q)),
      );
    }
    return results;
  }

  if (filters.query) {
    results = searchEvents(filters.query).filter((e) =>
      filters.genre ? e.genre === filters.genre : true,
    );
  }

  return results;
}
