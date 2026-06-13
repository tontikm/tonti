import type { Genre } from "@/lib/types";

export const GENRES: {
  id: Genre;
  label: string;
  color: string;
}[] = [
  { id: "electronic", label: "Electronic", color: "#8B5CF6" },
  { id: "hip-hop", label: "Hip-Hop", color: "#F59E0B" },
  { id: "indie", label: "Indie", color: "#10B981" },
  { id: "rock", label: "Rock", color: "#EF4444" },
  { id: "r-and-b", label: "R&B", color: "#EC4899" },
  { id: "latin", label: "Latin", color: "#F97316" },
  { id: "jazz", label: "Jazz", color: "#06B6D4" },
  { id: "country", label: "Country", color: "#84CC16" },
];

export function getGenreLabel(genre: Genre): string {
  return GENRES.find((g) => g.id === genre)?.label ?? genre;
}

export function getGenreColor(genre: Genre): string {
  return GENRES.find((g) => g.id === genre)?.color ?? "#8B5CF6";
}
