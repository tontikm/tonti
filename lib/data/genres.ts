import type { Genre } from "@/lib/types";

// Black & white system: genre "colours" are shades of grey/white, used
// sparingly (e.g. small dots) so the chrome stays monochrome.
export const GENRES: {
  id: Genre;
  label: string;
  color: string;
}[] = [
  { id: "amapiano", label: "Amapiano", color: "#ffffff" },
  { id: "afro-house", label: "Afro House", color: "#e5e5e5" },
  { id: "house", label: "House", color: "#d4d4d4" },
  { id: "gqom", label: "Gqom", color: "#bdbdbd" },
  { id: "hip-hop", label: "Hip-Hop", color: "#a3a3a3" },
  { id: "kwaito", label: "Kwaito", color: "#8f8f8f" },
  { id: "afro-pop", label: "Afro-pop", color: "#7a7a7a" },
  { id: "jazz", label: "Jazz", color: "#9a9a9a" },
  { id: "rock", label: "Rock", color: "#b0b0b0" },
  { id: "pop", label: "Pop", color: "#cccccc" },
];

export function getGenreLabel(genre: Genre): string {
  return GENRES.find((g) => g.id === genre)?.label ?? genre;
}

export function getGenreColor(genre: Genre): string {
  return GENRES.find((g) => g.id === genre)?.color ?? "#ffffff";
}
