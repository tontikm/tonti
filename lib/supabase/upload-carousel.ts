import type { SupabaseClient } from "@supabase/supabase-js";
import { validateHeroBannerFile } from "@/lib/supabase/upload-poster";

const BUCKET = "event-posters";

export async function uploadCarouselImage(
  supabase: SupabaseClient,
  slideId: string,
  file: File,
): Promise<string> {
  const validationError = validateHeroBannerFile(file);
  if (validationError) throw new Error(validationError);

  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const path = `carousel/${slideId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
