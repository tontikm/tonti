import type { City } from "@/lib/types";

const DEFAULT_CITY_IMAGE =
  "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800&q=80";

type CitySeed = {
  slug: string;
  name: string;
  province: string;
  image?: string;
  featured?: boolean;
};

const CITY_SEEDS: CitySeed[] = [
  {
    slug: "johannesburg",
    name: "Johannesburg",
    province: "Gauteng",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800&q=80",
  },
  {
    slug: "cape-town",
    name: "Cape Town",
    province: "Western Cape",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
  },
  {
    slug: "durban",
    name: "Durban",
    province: "KwaZulu-Natal",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1632249554253-67df6f0e3b5b?w=800&q=80",
  },
  {
    slug: "pretoria",
    name: "Pretoria",
    province: "Gauteng",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=800&q=80",
  },
  {
    slug: "gqeberha",
    name: "Gqeberha",
    province: "Eastern Cape",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1502786129293-79981df4e689?w=800&q=80",
  },
  {
    slug: "stellenbosch",
    name: "Stellenbosch",
    province: "Western Cape",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  },
  { slug: "soweto", name: "Soweto", province: "Gauteng" },
  { slug: "sandton", name: "Sandton", province: "Gauteng" },
  { slug: "midrand", name: "Midrand", province: "Gauteng" },
  { slug: "centurion", name: "Centurion", province: "Gauteng" },
  { slug: "roodepoort", name: "Roodepoort", province: "Gauteng" },
  { slug: "benoni", name: "Benoni", province: "Gauteng" },
  { slug: "vereeniging", name: "Vereeniging", province: "Gauteng" },
  { slug: "george", name: "George", province: "Western Cape" },
  { slug: "paarl", name: "Paarl", province: "Western Cape" },
  { slug: "hermanus", name: "Hermanus", province: "Western Cape" },
  { slug: "somerset-west", name: "Somerset West", province: "Western Cape" },
  { slug: "knysna", name: "Knysna", province: "Western Cape" },
  { slug: "mossel-bay", name: "Mossel Bay", province: "Western Cape" },
  { slug: "pietermaritzburg", name: "Pietermaritzburg", province: "KwaZulu-Natal" },
  { slug: "richards-bay", name: "Richards Bay", province: "KwaZulu-Natal" },
  { slug: "newcastle", name: "Newcastle", province: "KwaZulu-Natal" },
  { slug: "umhlanga", name: "Umhlanga", province: "KwaZulu-Natal" },
  { slug: "east-london", name: "East London", province: "Eastern Cape" },
  { slug: "makhanda", name: "Makhanda", province: "Eastern Cape" },
  { slug: "mthatha", name: "Mthatha", province: "Eastern Cape" },
  { slug: "bloemfontein", name: "Bloemfontein", province: "Free State" },
  { slug: "welkom", name: "Welkom", province: "Free State" },
  { slug: "mbombela", name: "Mbombela", province: "Mpumalanga" },
  { slug: "emalahleni", name: "eMalahleni", province: "Mpumalanga" },
  { slug: "secunda", name: "Secunda", province: "Mpumalanga" },
  { slug: "polokwane", name: "Polokwane", province: "Limpopo" },
  { slug: "tzaneen", name: "Tzaneen", province: "Limpopo" },
  { slug: "rustenburg", name: "Rustenburg", province: "North West" },
  { slug: "mahikeng", name: "Mahikeng", province: "North West" },
  { slug: "klerksdorp", name: "Klerksdorp", province: "North West" },
  { slug: "kimberley", name: "Kimberley", province: "Northern Cape" },
  { slug: "upington", name: "Upington", province: "Northern Cape" },
];

function toCity(seed: CitySeed): City {
  return {
    slug: seed.slug,
    name: seed.name,
    province: seed.province,
    image: seed.image ?? DEFAULT_CITY_IMAGE,
  };
}

/** Every city available when adding venues or filtering events. */
export const ALL_CITIES: City[] = CITY_SEEDS.map(toCity);

/** Cities highlighted on the homepage and quick event filters. */
export const FEATURED_CITIES: City[] = CITY_SEEDS.filter((city) => city.featured).map(
  toCity,
);

/** @deprecated Use ALL_CITIES or FEATURED_CITIES */
export const CITIES = ALL_CITIES;

export function getCityBySlug(slug: string): City | undefined {
  return ALL_CITIES.find((city) => city.slug === slug);
}

export function getCitiesGroupedByProvince(): { province: string; cities: City[] }[] {
  const groups = new Map<string, City[]>();

  for (const city of ALL_CITIES) {
    const list = groups.get(city.province) ?? [];
    list.push(city);
    groups.set(city.province, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([province, cities]) => ({
      province,
      cities: cities.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
