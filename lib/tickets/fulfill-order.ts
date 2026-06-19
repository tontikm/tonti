import type { SupabaseClient } from "@supabase/supabase-js";
import { generateTicketCode } from "@/lib/tickets";
import { getTicketsRemaining } from "@/lib/utils";

type LineItem = {
  tierId: string;
  tierName: string;
  qty: number;
  price: number;
};

type TierRow = {
  id: string;
  name: string;
  price: number;
  capacity: number;
  sold: number;
};

export async function fulfillTicketOrder(
  supabase: SupabaseClient,
  orderId: string,
  eventSlug: string,
  buyerName: string,
  lineItems: LineItem[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: tierRows } = await supabase
    .from("ticket_tiers")
    .select("id, name, price, capacity, sold")
    .eq("event_slug", eventSlug);

  if (!tierRows?.length) {
    return { ok: false, error: "No ticket tiers available." };
  }

  const tierMap = new Map(
    tierRows.map((tier) => [tier.id as string, tier as TierRow]),
  );

  for (const item of lineItems) {
    const tier = tierMap.get(item.tierId);
    if (!tier) return { ok: false, error: "Invalid ticket tier." };
    const remaining = getTicketsRemaining(tier);
    if (item.qty > remaining) {
      return {
        ok: false,
        error: `Only ${remaining} "${tier.name}" ticket${remaining === 1 ? "" : "s"} left.`,
      };
    }
  }

  const ticketRows: {
    order_id: string;
    event_slug: string;
    tier_id: string;
    tier_name: string;
    code: string;
    holder_name: string;
  }[] = [];

  const usedCodes = new Set<string>();

  for (const item of lineItems) {
    for (let i = 0; i < item.qty; i += 1) {
      let code = generateTicketCode();
      while (usedCodes.has(code)) {
        code = generateTicketCode();
      }
      usedCodes.add(code);
      ticketRows.push({
        order_id: orderId,
        event_slug: eventSlug,
        tier_id: item.tierId,
        tier_name: item.tierName,
        code,
        holder_name: buyerName,
      });
    }
  }

  const { error: ticketsError } = await supabase.from("tickets").insert(ticketRows);

  if (ticketsError) {
    return { ok: false, error: ticketsError.message };
  }

  for (const item of lineItems) {
    const tier = tierMap.get(item.tierId)!;
    const { error: soldError } = await supabase
      .from("ticket_tiers")
      .update({ sold: tier.sold + item.qty })
      .eq("event_slug", eventSlug)
      .eq("id", item.tierId);

    if (soldError) {
      return { ok: false, error: soldError.message };
    }
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "confirmed" })
    .eq("id", orderId);

  if (orderError) {
    return { ok: false, error: orderError.message };
  }

  return { ok: true };
}

export type { LineItem };
