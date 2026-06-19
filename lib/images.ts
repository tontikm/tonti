const DEFAULT_EVENT_POSTER =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80";

function getAllowedImageHostnames(): Set<string> {
  const hostnames = new Set(["images.unsplash.com"]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      hostnames.add(new URL(supabaseUrl).hostname);
    } catch {
      // ignore invalid env
    }
  }

  return hostnames;
}

export function isAllowedImageUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:" && protocol !== "http:") return false;
    return getAllowedImageHostnames().has(hostname);
  } catch {
    return false;
  }
}

/** Use for next/image src — falls back when URL is missing or from an unconfigured host. */
export function getSafeEventImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return DEFAULT_EVENT_POSTER;
  return isAllowedImageUrl(url) ? url : DEFAULT_EVENT_POSTER;
}

const DEFAULT_VENUE_IMAGE =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80";

const DEFAULT_ARTIST_IMAGE =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80";

export function getSafeVenueImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return DEFAULT_VENUE_IMAGE;
  return isAllowedImageUrl(url) ? url : DEFAULT_VENUE_IMAGE;
}

export function getSafeArtistImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return DEFAULT_ARTIST_IMAGE;
  return isAllowedImageUrl(url) ? url : DEFAULT_ARTIST_IMAGE;
}

export function getSafeOrganizerLogoUrl(url: string | null | undefined): string {
  if (!url?.trim()) return DEFAULT_EVENT_POSTER;
  return isAllowedImageUrl(url) ? url : DEFAULT_EVENT_POSTER;
}

export { DEFAULT_EVENT_POSTER, DEFAULT_VENUE_IMAGE, DEFAULT_ARTIST_IMAGE };
