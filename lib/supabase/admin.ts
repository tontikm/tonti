import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/** Service-role client for organizer writes. Requires SUPABASE_SERVICE_ROLE_KEY. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    cached = null;
    return cached;
  }

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export function isSupabaseAdminConfigured(): boolean {
  return getSupabaseAdmin() !== null;
}
