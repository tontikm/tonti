import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "event-posters";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function validatePosterFile(file: File): string | null {
  if (!file.size) return "Poster image is required.";
  if (file.size > MAX_BYTES) return "Poster must be 5 MB or smaller.";
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Poster must be a JPG, PNG, WebP, or GIF image.";
  }
  return null;
}

export async function uploadEventPoster(
  supabase: SupabaseClient,
  eventSlug: string,
  file: File,
): Promise<string> {
  const validationError = validatePosterFile(file);
  if (validationError) throw new Error(validationError);

  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const path = `${eventSlug}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function validateOrganizerLogoFile(file: File): string | null {
  if (!file.size) return "Organizer logo is required.";
  if (file.size > MAX_BYTES) return "Organizer logo must be 5 MB or smaller.";
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Organizer logo must be a JPG, PNG, WebP, or GIF image.";
  }
  return null;
}

export async function uploadOrganizerLogo(
  supabase: SupabaseClient,
  eventSlug: string,
  file: File,
): Promise<string> {
  const validationError = validateOrganizerLogoFile(file);
  if (validationError) throw new Error(validationError);

  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const path = `${eventSlug}/logo-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProfileOrganizerLogo(
  supabase: SupabaseClient,
  organizerSlug: string,
  file: File,
): Promise<string> {
  return uploadOrganizerLogo(supabase, `profile-${organizerSlug}`, file);
}
