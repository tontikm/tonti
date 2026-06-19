import type { EventCategory } from "@/lib/types";

export const EVENT_CATEGORIES: {
  id: EventCategory;
  label: string;
  color: string;
}[] = [
  { id: "nightlife", label: "Nightlife", color: "#ffffff" },
  { id: "festival", label: "Festival", color: "#e5e5e5" },
  { id: "music", label: "Music", color: "#d4d4d4" },
  { id: "lifestyle", label: "Lifestyle", color: "#bdbdbd" },
];

export function getCategoryLabel(category: EventCategory): string {
  return EVENT_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function getCategoryColor(category: EventCategory): string {
  return EVENT_CATEGORIES.find((c) => c.id === category)?.color ?? "#ffffff";
}

export function isEventCategory(value: string): value is EventCategory {
  return EVENT_CATEGORIES.some((category) => category.id === value);
}

/** Map legacy genre slugs from older seed/DB rows to the new category system. */
export function legacyGenreToCategory(genre: string): EventCategory {
  const map: Record<string, EventCategory> = {
    amapiano: "nightlife",
    "afro-house": "nightlife",
    house: "nightlife",
    gqom: "nightlife",
    "hip-hop": "music",
    kwaito: "nightlife",
    "afro-pop": "music",
    jazz: "music",
    rock: "music",
    pop: "music",
    nightlife: "nightlife",
    festival: "festival",
    music: "music",
    lifestyle: "lifestyle",
  };
  return map[genre] ?? "music";
}
