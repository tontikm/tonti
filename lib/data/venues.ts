import type { Venue } from "@/lib/types";

export const VENUES: Venue[] = [
  {
    slug: "echo-pavilion",
    name: "Echo Pavilion",
    city: "Los Angeles",
    state: "CA",
    address: "1822 Sunset Blvd, Los Angeles, CA 90026",
    capacity: 3500,
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  },
  {
    slug: "warehouse-9",
    name: "Warehouse 9",
    city: "Brooklyn",
    state: "NY",
    address: "9 Wyckoff Ave, Brooklyn, NY 11237",
    capacity: 1200,
    image:
      "https://images.unsplash.com/photo-1506157782851-9777a7f546ce?w=800&q=80",
  },
  {
    slug: "pulse-club",
    name: "Pulse Club",
    city: "Miami",
    state: "FL",
    address: "234 Ocean Dr, Miami Beach, FL 33139",
    capacity: 800,
    image:
      "https://images.unsplash.com/photo-1566737235753-fb6843f37964?w=800&q=80",
  },
  {
    slug: "the-mohawk",
    name: "The Mohawk",
    city: "Austin",
    state: "TX",
    address: "912 Red River St, Austin, TX 78701",
    capacity: 1500,
    image:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ca?w=800&q=80",
  },
  {
    slug: "metro-hall",
    name: "Metro Hall",
    city: "Chicago",
    state: "IL",
    address: "3730 N Clark St, Chicago, IL 60613",
    capacity: 2800,
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
  },
  {
    slug: "ryman-stage",
    name: "Ryman Stage",
    city: "Nashville",
    state: "TN",
    address: "116 5th Ave N, Nashville, TN 37219",
    capacity: 2362,
    image:
      "https://images.unsplash.com/photo-1506157782851-9777a7f546ce?w=800&q=80",
  },
];

export function getVenueBySlug(slug: string): Venue | undefined {
  return VENUES.find((v) => v.slug === slug);
}

export function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}
