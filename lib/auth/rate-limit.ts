import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type RateLimitOptions = {
  maxAttempts: number;
  windowSeconds: number;
};

const DEFAULT_LOGIN: RateLimitOptions = {
  maxAttempts: 10,
  windowSeconds: 15 * 60,
};

const DEFAULT_TICKET_VERIFY: RateLimitOptions = {
  maxAttempts: 40,
  windowSeconds: 60,
};

const DEFAULT_CHECK_IN: RateLimitOptions = {
  maxAttempts: 120,
  windowSeconds: 60,
};

async function callRateLimitRpc(
  bucket: string,
  key: string,
  options: RateLimitOptions,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return true;

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_bucket: bucket,
    p_key: key,
    p_max_attempts: options.maxAttempts,
    p_window_seconds: options.windowSeconds,
  });

  if (error) {
    if (
      error.message.includes("check_rate_limit") ||
      error.message.includes("rate_limit_events")
    ) {
      console.warn(
        "[Spotra] Rate limiting unavailable. Run migration 0026_security_hardening.sql.",
      );
      return true;
    }
    console.error("[Spotra] Rate limit error:", error.message);
    return true;
  }

  return data === true;
}

export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

export async function enforceRateLimit(
  bucket: string,
  key: string,
  options: RateLimitOptions,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await callRateLimitRpc(bucket, key, options);
  if (!allowed) {
    return {
      ok: false,
      error: "Too many attempts. Please wait a few minutes and try again.",
    };
  }
  return { ok: true };
}

export async function enforceLoginRateLimit(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = await getClientIp();
  return enforceRateLimit(
    "login",
    `${email.toLowerCase()}:${ip}`,
    DEFAULT_LOGIN,
  );
}

export async function enforceTicketVerifyRateLimit(
  code?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = await getClientIp();
  const suffix = code ? `:${code.trim().toUpperCase()}` : "";
  return enforceRateLimit(
    "ticket-verify",
    `${ip}${suffix}`,
    DEFAULT_TICKET_VERIFY,
  );
}

export async function enforceCheckInRateLimit(
  organizerKey: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = await getClientIp();
  return enforceRateLimit(
    "check-in",
    `${organizerKey}:${ip}`,
    DEFAULT_CHECK_IN,
  );
}
