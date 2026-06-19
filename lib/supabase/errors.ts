type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  cause?: unknown;
};

export function formatSupabaseError(error: unknown): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;

  if (error instanceof Error) {
    const parts = [error.message, error.name].filter(Boolean);
    if (error.cause) {
      parts.push(formatSupabaseError(error.cause));
    }
    return parts.join(" · ") || "Unknown error";
  }

  if (typeof error !== "object") return String(error);

  const e = error as SupabaseErrorLike;
  const parts = [e.message, e.code, e.details, e.hint].filter(Boolean);
  if (e.cause) {
    parts.push(formatSupabaseError(e.cause));
  }
  if (parts.length > 0) return parts.join(" · ");

  try {
    const json = JSON.stringify(error);
    return json === "{}" ? "Unknown Supabase error" : json;
  } catch {
    return String(error);
  }
}

export function isMissingColumnError(error: unknown): boolean {
  const formatted = formatSupabaseError(error).toLowerCase();
  return (
    formatted.includes("42703") ||
    formatted.includes("pgrst204") ||
    formatted.includes("schema cache") ||
    formatted.includes("does not exist") ||
    formatted.includes("organizer_name") ||
    formatted.includes("organizer_logo")
  );
}

export const ORGANIZER_BRANDING_MIGRATION_HINT =
  "Run supabase/migrations/0004_event_organizer_branding.sql in the Supabase SQL editor to save organizer names and logos.";

export const FAN_ORDERS_MIGRATION_HINT =
  "Run supabase/migrations/0007_fan_orders.sql in the Supabase SQL editor to link orders to fan accounts.";

export function isConnectionError(error: unknown): boolean {
  const formatted = formatSupabaseError(error).toLowerCase();
  return (
    formatted.includes("fetch failed") ||
    formatted.includes("enotfound") ||
    formatted.includes("econnrefused") ||
    formatted.includes("network") ||
    formatted.includes("timeout") ||
    formatted.includes("unable to reach")
  );
}
