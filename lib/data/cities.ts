import type { City } from "@/lib/types";

export const CITIES: City[] = [
  {
    slug: "los-angeles",
    name: "Los Angeles",
    state: "CA",
    image:
      "https://images.unsplash.com/photo-1515896769750-31548aa180ed?w=800&q=80",
  },
  {
    slug: "new-york",
    name: "New York",
    state: "NY",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
  },
  {
    slug: "miami",
    name: "Miami",
    state: "FL",
    image:
      "https://images.unsplash.com/photo-1518002171953-f180ed2560fe?w=800&q=80",
  },
  {
    slug: "austin",
    name: "Austin",
    state: "TX",
    image:
      "https://images.unsplash.com/photo-1531218150217-54595bc2e934?w=800&q=80",
  },
  {
    slug: "chicago",
    name: "Chicago",
    state: "IL",
    image:
      "https://images.unsplash.com/photo-1494522358652-f30e688814c8?w=800&q=80",
  },
  {
    slug: "nashville",
    name: "Nashville",
    state: "TN",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
