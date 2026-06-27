import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parseScannedTicketPayload,
  TICKET_CODE_PATTERN,
  validateRotatingOtpForCheckIn,
} from "@/lib/tickets/rotating-qr";
import { ticketCodeSchema } from "@/lib/validation/schemas";

export type TicketCheckInRow = {
  code: string;
  event_slug: string;
  status: string;
  totp_secret: string | null;
  checked_in_at: string | null;
  order_id: string;
  tier_name: string;
  holder_name: string;
};

const TICKET_CHECK_IN_SELECT_WITH_SECRET =
  "code, event_slug, status, totp_secret, checked_in_at, order_id, tier_name, holder_name";

const TICKET_CHECK_IN_SELECT_BASE =
  "code, event_slug, status, checked_in_at, order_id, tier_name, holder_name";

function isMissingTotpSecretColumn(error: { message?: string } | null): boolean {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("totp_secret") && message.includes("column");
}

export function parseCheckInScan(rawScan: string): {
  code: string;
  otp?: string;
} {
  const payload = parseScannedTicketPayload(rawScan);
  if (!payload.code || !TICKET_CODE_PATTERN.test(payload.code)) {
    return { code: "" };
  }

  const parsedCode = ticketCodeSchema.safeParse(payload.code);
  if (!parsedCode.success) {
    return { code: "" };
  }

  return {
    code: parsedCode.data,
    otp: payload.otp,
  };
}

export async function loadTicketForCheckIn(
  supabase: SupabaseClient,
  code: string,
): Promise<TicketCheckInRow | null> {
  const withSecret = await supabase
    .from("tickets")
    .select(TICKET_CHECK_IN_SELECT_WITH_SECRET)
    .eq("code", code)
    .maybeSingle();

  if (!withSecret.error && withSecret.data) {
    return withSecret.data as TicketCheckInRow;
  }

  if (withSecret.error && !isMissingTotpSecretColumn(withSecret.error)) {
    return null;
  }

  const fallback = await supabase
    .from("tickets")
    .select(TICKET_CHECK_IN_SELECT_BASE)
    .eq("code", code)
    .maybeSingle();

  if (fallback.error || !fallback.data) {
    return null;
  }

  return {
    ...(fallback.data as Omit<TicketCheckInRow, "totp_secret">),
    totp_secret: null,
  };
}

export function validateTicketOtpForCheckIn(
  ticket: Pick<TicketCheckInRow, "totp_secret">,
  otp: string | undefined,
): { ok: true } | { ok: false; error: string } {
  return validateRotatingOtpForCheckIn(ticket.totp_secret, otp);
}
