"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { TicketTier } from "@/lib/types";
import { getFanUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isFanAuthConfigured } from "@/lib/supabase/server-auth";
import { isPayfastConfigured } from "@/lib/payments/config";
import {
  fulfillTicketOrder,
  type LineItem,
} from "@/lib/tickets/fulfill-order";
import { getTicketsRemaining } from "@/lib/utils";
import {
  FAN_ORDERS_MIGRATION_HINT,
  isMissingColumnError,
} from "@/lib/supabase/errors";
import { requireOwnEvent } from "@/lib/organizer/require-auth";
import { normalizeWhatsAppPhone } from "@/lib/tickets/whatsapp";

export type ClaimState = {
  error?: string;
};

type TierSelection = Record<string, number>;

function parseSelections(raw: string): TierSelection | null {
  try {
    const parsed = JSON.parse(raw) as TierSelection;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function revalidateTicketPaths(eventSlug: string) {
  revalidatePath(`/events/${eventSlug}`);
  revalidatePath(`/events/${eventSlug}/checkout`);
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath(`/organizer/events/${eventSlug}/tickets`);
}

async function buildLineItems(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  eventSlug: string,
  chosen: [string, number][],
): Promise<{ lineItems: LineItem[]; totalAmount: number } | { error: string }> {
  const { data: tierRows } = await supabase
    .from("ticket_tiers")
    .select("id, name, price, capacity, sold")
    .eq("event_slug", eventSlug);

  if (!tierRows?.length) return { error: "No ticket tiers available." };

  const tierMap = new Map(
    tierRows.map((tier) => [tier.id as string, tier as TicketTier & { sold: number }]),
  );

  let totalAmount = 0;
  const lineItems: LineItem[] = [];

  for (const [tierId, qty] of chosen) {
    const tier = tierMap.get(tierId);
    if (!tier) return { error: "Invalid ticket tier selected." };
    if (qty > 8) return { error: "Maximum 8 tickets per tier." };

    const remaining = getTicketsRemaining(tier);
    if (qty > remaining) {
      return {
        error: `Only ${remaining} "${tier.name}" ticket${remaining === 1 ? "" : "s"} left.`,
      };
    }

    totalAmount += Number(tier.price) * qty;
    lineItems.push({
      tierId,
      tierName: tier.name,
      qty,
      price: Number(tier.price),
    });
  }

  return { lineItems, totalAmount };
}

type OrderInsertRow = {
  event_slug: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string | null;
  user_id?: string | null;
  total_amount: number;
  ticket_count: number;
  status: string;
  payment_provider?: string;
  selections?: LineItem[];
};

async function insertOrderRow(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  row: OrderInsertRow,
): Promise<{ id: string } | { error: string }> {
  let rowToInsert: Record<string, unknown> = { ...row };

  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase
      .from("orders")
      .insert(rowToInsert)
      .select("id")
      .single();

    if (!error && data) {
      return { id: data.id as string };
    }

    if (!error) break;

    if (error.message.includes("selections")) {
      return {
        error:
          "Payments require migration 0006_payments.sql in the Supabase SQL editor.",
      };
    }

    if (!isMissingColumnError(error)) {
      return { error: formatOrderInsertError(error.message) };
    }

    const message = error.message.toLowerCase();
    if (message.includes("buyer_phone") && "buyer_phone" in rowToInsert) {
      const { buyer_phone: _buyerPhone, ...rest } = rowToInsert;
      rowToInsert = rest;
      continue;
    }
    if (message.includes("user_id") && "user_id" in rowToInsert) {
      const { user_id: _userId, ...rest } = rowToInsert;
      rowToInsert = rest;
      continue;
    }

    return { error: formatOrderInsertError(error.message) };
  }

  return { error: "Could not create order." };
}

function formatOrderInsertError(message: string): string {
  if (message.toLowerCase().includes("user_id")) {
    return FAN_ORDERS_MIGRATION_HINT;
  }
  return message;
}

export async function claimTickets(
  _prev: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error:
        "Ticket RSVP requires Supabase. Add your keys to .env.local and run the migrations.",
    };
  }

  const eventSlug = String(formData.get("eventSlug") ?? "").trim();
  const buyerName = String(formData.get("buyerName") ?? "").trim();
  const buyerEmail = String(formData.get("buyerEmail") ?? "").trim().toLowerCase();
  const buyerPhoneRaw = String(formData.get("buyerPhone") ?? "").trim();
  const whatsappOptIn = formData.get("whatsappOptIn") === "on";
  const acceptTerms = formData.get("acceptTerms") === "on";
  const selections = parseSelections(String(formData.get("selections") ?? "{}"));

  if (isFanAuthConfigured()) {
    const user = await getFanUser();
    if (!user) {
      return { error: "Sign in to complete checkout." };
    }
    if (buyerEmail !== user.email.toLowerCase()) {
      return { error: "Use the email address on your signed-in account." };
    }
  }

  const fanUser = await getFanUser();
  const userId = fanUser?.id ?? null;

  if (!eventSlug) return { error: "Event not found." };
  if (!acceptTerms) return { error: "Accept the terms to continue." };
  if (!buyerName) return { error: "Your name is required." };
  if (!buyerEmail || !isValidEmail(buyerEmail)) {
    return { error: "A valid email address is required." };
  }

  const buyerPhone = buyerPhoneRaw
    ? normalizeWhatsAppPhone(buyerPhoneRaw)
    : null;
  if (whatsappOptIn && !buyerPhone) {
    return {
      error: buyerPhoneRaw
        ? "Enter a valid South African mobile number for WhatsApp delivery."
        : "Enter your mobile number to receive tickets on WhatsApp.",
    };
  }

  if (!selections) return { error: "Invalid ticket selection." };

  const chosen = Object.entries(selections).filter(([, qty]) => qty > 0);
  if (chosen.length === 0) {
    return { error: "Select at least one ticket." };
  }

  const totalTickets = chosen.reduce((sum, [, qty]) => sum + qty, 0);
  if (totalTickets > 10) {
    return { error: "Maximum 10 tickets per order." };
  }

  const { data: eventRow } = await supabase
    .from("events")
    .select("slug, title")
    .eq("slug", eventSlug)
    .maybeSingle();

  if (!eventRow) return { error: "Event not found." };

  const built = await buildLineItems(supabase, eventSlug, chosen);
  if ("error" in built) return { error: built.error };

  const { lineItems, totalAmount } = built;

  if (totalAmount > 0 && isPayfastConfigured()) {
    const orderResult = await insertOrderRow(supabase, {
      event_slug: eventSlug,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone,
      user_id: userId,
      total_amount: totalAmount,
      ticket_count: totalTickets,
      status: "pending_payment",
      payment_provider: "payfast",
      selections: lineItems,
    });

    if ("error" in orderResult) {
      return { error: orderResult.error };
    }

    redirect(`/payments/payfast/start?orderId=${orderResult.id}`);
  }

  const orderResult = await insertOrderRow(supabase, {
    event_slug: eventSlug,
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    buyer_phone: buyerPhone,
    user_id: userId,
    total_amount: totalAmount,
    ticket_count: totalTickets,
    status: "confirmed",
  });

  if ("error" in orderResult) {
    return { error: orderResult.error };
  }

  const order = { id: orderResult.id };

  const fulfilled = await fulfillTicketOrder(
    supabase,
    order.id,
    eventSlug,
    buyerName,
    lineItems,
  );

  if (!fulfilled.ok) {
    await supabase.from("orders").delete().eq("id", order.id);
    if (fulfilled.error.includes("Could not find the table")) {
      return {
        error:
          "Tickets table missing. Run supabase/migrations/0003_tickets.sql in the Supabase SQL editor.",
      };
    }
    return { error: fulfilled.error };
  }

  revalidateTicketPaths(eventSlug);
  redirect(`/tickets/${order.id}`);
}

export async function checkInTicket(code: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const normalized = code.trim().toUpperCase();
  const { data: existing } = await supabase
    .from("tickets")
    .select("status, event_slug")
    .eq("code", normalized)
    .maybeSingle();

  if (!existing) return { ok: false, error: "Ticket not found." };

  const eventSlug = existing.event_slug as string;
  const ownEvent = await requireOwnEvent(eventSlug);
  if ("error" in ownEvent) {
    return { ok: false, error: ownEvent.error };
  }

  if (existing.status === "used") {
    return { ok: false, error: "Already checked in." };
  }
  if (existing.status !== "valid") {
    return { ok: false, error: "Ticket is not valid." };
  }

  const { error } = await supabase
    .from("tickets")
    .update({
      status: "used",
      checked_in_at: new Date().toISOString(),
    })
    .eq("code", normalized);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/tickets/verify/${normalized}`);
  return { ok: true };
}
