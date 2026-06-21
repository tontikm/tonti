import { cache } from "react";
import type { Artist } from "@/lib/types";
import { getSupabaseServer } from "@/lib/supabase/server";
import { DEFAULT_ARTIST_IMAGE } from "@/lib/images";

export const ARTISTS: Artist[] = [
  {
    slug: "piano-republic",
    name: "Piano Republic",
    genre: "amapiano",
    image:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429da7?w=600&q=80",
    bio: "Pretoria amapiano collective behind some of the biggest log-drum anthems in the country.",
  },
  {
    slug: "nomvula",
    name: "Nomvula",
    genre: "afro-house",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    bio: "Afro-house vocalist and producer fusing spiritual melodies with deep four-to-the-floor grooves.",
  },
  {
    slug: "k1ng-verse",
    name: "K1NG Verse",
    genre: "hip-hop",
    image:
      "https://images.unsplash.com/photo-1459745456775-9afc3a8049bc?w=600&q=80",
    bio: "Joburg lyricist blending boom-bap roots with new-school SA trap.",
  },
  {
    slug: "cape-town-quartet",
    name: "Cape Town Quartet",
    genre: "jazz",
    image:
      "https://images.unsplash.com/photo-1415201364774-f6f0ff5a0287?w=600&q=80",
    bio: "Contemporary Cape jazz ensemble carrying the legacy of the Mother City sound.",
  },
  {
    slug: "veld-riders",
    name: "Veld Riders",
    genre: "rock",
    image:
      "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&q=80",
    bio: "High-octane SA rock band built for festival main stages.",
  },
  {
    slug: "naledi",
    name: "Naledi",
    genre: "pop",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    bio: "Pop sensation bringing stadium-sized choruses and slick production.",
  },
];

function mapArtistRow(row: Record<string, unknown>): Artist {
  return {
    slug: row.slug as string,
    name: row.name as string,
    genre: row.genre as Artist["genre"],
    image: (row.image as string) || DEFAULT_ARTIST_IMAGE,
    bio: (row.bio as string) ?? undefined,
  };
}

const loadArtists = cache(async (): Promise<Artist[]> => {
  const supabase = getSupabaseServer();
  if (!supabase) return ARTISTS;

  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("name", { ascending: true });

  if (error || !data?.length) {
    if (error) console.error("Supabase artists fetch failed, using seed:", error);
    return ARTISTS;
  }

  return data.map(mapArtistRow);
});

export async function getAllArtists(): Promise<Artist[]> {
  return loadArtists();
}

export async function getArtistBySlug(slug: string): Promise<Artist | undefined> {
  const artists = await loadArtists();
  return artists.find((artist) => artist.slug === slug);
}
