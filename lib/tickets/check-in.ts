import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parseScannedTicketPayload,
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

export function parseCheckInScan(rawScan: string): {
  code: string;
  otp?: string;
} {
  const payload = parseScannedTicketPayload(rawScan);
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
  const { data } = await supabase
    .from("tickets")
    .select(
      "code, event_slug, status, totp_secret, checked_in_at, order_id, tier_name, holder_name",
    )
    .eq("code", code)
    .maybeSingle();

  return data as TicketCheckInRow | null;
}

export function validateTicketOtpForCheckIn(
  ticket: Pick<TicketCheckInRow, "totp_secret">,
  otp: string | undefined,
): { ok: true } | { ok: false; error: string } {
  return validateRotatingOtpForCheckIn(ticket.totp_secret, otp);
}
