import type { SupabaseClient } from "@supabase/supabase-js";
import { generateTicketCode } from "@/lib/tickets";

type LineItem = {
  tierId: string;
  tierName: string;
  qty: number;
  price: number;
};

type FulfillRpcResult = {
  ok: boolean;
  error?: string;
};

function buildLineItemsPayload(
  lineItems: LineItem[],
): { payload: Record<string, unknown>[] } | { error: string } {
  const payload: Record<string, unknown>[] = [];

  for (const item of lineItems) {
    if (item.qty < 1) {
      return { error: "Invalid ticket selection." };
    }

    const codes: string[] = [];
    const usedCodes = new Set<string>();

    for (let i = 0; i < item.qty; i += 1) {
      let code = generateTicketCode();
      while (usedCodes.has(code)) {
        code = generateTicketCode();
      }
      usedCodes.add(code);
      codes.push(code);
    }

    payload.push({
      tierId: item.tierId,
      tierName: item.tierName,
      qty: item.qty,
      codes,
    });
  }

  return { payload };
}

export async function fulfillTicketOrder(
  supabase: SupabaseClient,
  orderId: string,
  eventSlug: string,
  buyerName: string,
  lineItems: LineItem[],
  options?: { confirmOrder?: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const built = buildLineItemsPayload(lineItems);
  if ("error" in built) {
    return { ok: false, error: built.error };
  }

  const confirmOrder = options?.confirmOrder ?? true;

  const { data, error } = await supabase.rpc("fulfill_ticket_order", {
    p_order_id: orderId,
    p_event_slug: eventSlug,
    p_buyer_name: buyerName,
    p_line_items: built.payload,
    p_confirm_order: confirmOrder,
  });

  if (error) {
    if (
      error.message.includes("fulfill_ticket_order") ||
      error.message.includes("Could not find the function")
    ) {
      return {
        ok: false,
        error:
          "Run migration 0026_security_hardening.sql in the Supabase SQL editor.",
      };
    }
    return { ok: false, error: error.message };
  }

  const result = data as FulfillRpcResult | null;
  if (!result?.ok) {
    return { ok: false, error: result?.error ?? "Could not issue tickets." };
  }

  return { ok: true };
}

export type { LineItem };
