import { cache } from "react";
import type { Venue } from "@/lib/types";
import { getSupabaseServer } from "@/lib/supabase/server";
import { DEFAULT_VENUE_IMAGE } from "@/lib/images";

export const VENUES: Venue[] = [
  {
    slug: "kirstenbosch",
    name: "Kirstenbosch Botanical Gardens",
    city: "Cape Town",
    province: "Western Cape",
    address: "Rhodes Dr, Newlands, Cape Town, 7700",
    capacity: 7000,
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  },
  {
    slug: "sun-arena",
    name: "Sun Arena, Time Square",
    city: "Pretoria",
    province: "Gauteng",
    address: "209 Aramist Ave, Menlyn, Pretoria, 0181",
    capacity: 8500,
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
  },
  {
    slug: "grandwest-arena",
    name: "GrandWest Grand Arena",
    city: "Cape Town",
    province: "Western Cape",
    address: "1 Vanguard Dr, Goodwood, Cape Town, 7460",
    capacity: 5000,
    image:
      "https://images.unsplash.com/photo-1566737235753-fb6843f37964?w=800&q=80",
  },
  {
    slug: "constitution-hill",
    name: "Constitution Hill",
    city: "Johannesburg",
    province: "Gauteng",
    address: "11 Kotze St, Braamfontein, Johannesburg, 2017",
    capacity: 4000,
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
  },
  {
    slug: "durban-icc-arena",
    name: "Durban ICC Arena",
    city: "Durban",
    province: "KwaZulu-Natal",
    address: "45 Bram Fischer Rd, Durban, 4001",
    capacity: 10000,
    image:
      "https://images.unsplash.com/photo-1506157782851-9777a7f546ce?w=800&q=80",
  },
  {
    slug: "the-boardwalk",
    name: "The Boardwalk",
    city: "Gqeberha",
    province: "Eastern Cape",
    address: "Marine Dr, Summerstrand, Gqeberha, 6001",
    capacity: 2500,
    image:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ca?w=800&q=80",
  },
  {
    slug: "oude-libertas",
    name: "Oude Libertas Amphitheatre",
    city: "Stellenbosch",
    province: "Western Cape",
    address: "Oude Libertas St, Stellenbosch, 7600",
    capacity: 430,
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
  },
];

function mapVenueRow(row: Record<string, unknown>): Venue {
  return {
    slug: row.slug as string,
    name: row.name as string,
    city: row.city as string,
    province: row.province as string,
    address: row.address as string,
    capacity: Number(row.capacity ?? 0),
    image: (row.image as string) || DEFAULT_VENUE_IMAGE,
  };
}

const loadVenues = cache(async (): Promise<Venue[]> => {
  const supabase = getSupabaseServer();
  if (!supabase) return VENUES;

  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .order("name", { ascending: true });

  if (error || !data?.length) {
    if (error) console.error("Supabase venues fetch failed, using seed:", error);
    return VENUES;
  }

  return data.map(mapVenueRow);
});

export async function getAllVenues(): Promise<Venue[]> {
  return loadVenues();
}

export async function getVenueBySlug(slug: string): Promise<Venue | undefined> {
  const venues = await loadVenues();
  return venues.find((venue) => venue.slug === slug);
}

export function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}
