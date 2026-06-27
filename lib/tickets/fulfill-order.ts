import type { SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { generateTicketCode } from "@/lib/tickets";

export type LineItem = {
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
    const secrets: string[] = [];
    const usedCodes = new Set<string>();

    for (let i = 0; i < item.qty; i += 1) {
      let code = generateTicketCode();
      while (usedCodes.has(code)) {
        code = generateTicketCode();
      }
      usedCodes.add(code);
      codes.push(code);
      secrets.push(randomBytes(20).toString("base64"));
    }

    payload.push({
      tierId: item.tierId,
      tierName: item.tierName,
      qty: item.qty,
      codes,
      secrets,
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
          "Run migrations 0026_security_hardening.sql and 0029_rotating_ticket_qr.sql in the Supabase SQL editor.",
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

export async function issueTicketsIfMissing(
  supabase: SupabaseClient,
  orderId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { count } = await supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId);

  if (count && count > 0) {
    return { ok: true };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("event_slug, buyer_name, status, selections")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  if (order.status !== "confirmed") {
    return { ok: false, error: "Payment is still processing." };
  }

  const lineItems = (order.selections ?? []) as LineItem[];
  if (!lineItems.length) {
    return { ok: false, error: "Order is missing ticket selections." };
  }

  return fulfillTicketOrder(
    supabase,
    orderId,
    order.event_slug as string,
    order.buyer_name as string,
    lineItems,
    { confirmOrder: false },
  );
}
