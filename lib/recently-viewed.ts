const KEY = "tonti:recently-viewed";
const MAX = 8;

export function recordRecentlyViewed(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readRecentlyViewed().filter((s) => s !== slug);
    const next = [slug, ...existing].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export function readRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string")
      : [];
  } catch {
    return [];
  }
}
