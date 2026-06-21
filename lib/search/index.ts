import { getPublicEvents } from "@/lib/data/events";
import { getAllArtists } from "@/lib/data/artists";
import { getAllVenues } from "@/lib/data/venues";
import { ALL_CITIES } from "@/lib/data/cities";

export type SearchItemType = "event" | "artist" | "venue" | "city";

export type SearchItem = {
  id: string;
  type: SearchItemType;
  title: string;
  subtitle?: string;
  href: string;
  image?: string;
  keywords: string;
};

/** Builds a compact client-side search index across the whole catalogue. */
export async function buildSearchIndex(): Promise<SearchItem[]> {
  const [events, artists, venues] = await Promise.all([
    getPublicEvents(),
    getAllArtists(),
    getAllVenues(),
  ]);

  const eventItems: SearchItem[] = events.map((event) => ({
    id: `event:${event.slug}`,
    type: "event",
    title: event.title,
    subtitle: `${event.venue.name}, ${event.venue.city}`,
    href: `/events/${event.slug}`,
    image: event.image,
    keywords: [
      event.title,
      event.subtitle ?? "",
      event.venue.name,
      event.venue.city,
      event.category,
      ...event.tags,
      ...event.artists.map((a) => a.name),
    ]
      .join(" ")
      .toLowerCase(),
  }));

  const artistItems: SearchItem[] = artists.map((artist) => ({
    id: `artist:${artist.slug}`,
    type: "artist",
    title: artist.name,
    subtitle: artist.genre,
    href: `/artists/${artist.slug}`,
    image: artist.image,
    keywords: `${artist.name} ${artist.genre}`.toLowerCase(),
  }));

  const venueItems: SearchItem[] = venues.map((venue) => ({
    id: `venue:${venue.slug}`,
    type: "venue",
    title: venue.name,
    subtitle: `${venue.city}, ${venue.province}`,
    href: `/venues/${venue.slug}`,
    image: venue.image,
    keywords: `${venue.name} ${venue.city} ${venue.province}`.toLowerCase(),
  }));

  const cityItems: SearchItem[] = ALL_CITIES.map((city) => ({
    id: `city:${city.slug}`,
    type: "city",
    title: city.name,
    subtitle: "City",
    href: `/events?city=${city.slug}`,
    keywords: `${city.name}`.toLowerCase(),
  }));

  return [...eventItems, ...artistItems, ...venueItems, ...cityItems];
}
