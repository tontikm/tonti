import { cache } from "react";
import type { Artist } from "@/lib/types";
import { getSupabaseServer } from "@/lib/supabase/server";
import { DEFAULT_ARTIST_IMAGE } from "@/lib/images";

export const ARTISTS: Artist[] = [];

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
