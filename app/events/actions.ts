"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { TicketTier } from "@/lib/types";
import { getFanUser } from "@/lib/auth/session";
import { enforceCheckInRateLimit } from "@/lib/auth/rate-limit";
import { followEvent, unfollowEvent } from "@/lib/fan/follows";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getOrganizerSession } from "@/lib/organizer/session";
import { isFanAuthConfigured } from "@/lib/supabase/server-auth";
import { isPayfastConfigured } from "@/lib/payments/config";
import {
  computeOrderAmounts,
  computeOrderAmountsWithDiscount,
} from "@/lib/payments/service-fee";
import {
  fulfillTicketOrder,
  type LineItem,
} from "@/lib/tickets/fulfill-order";
import { getTicketsRemaining } from "@/lib/utils";
import {
  FAN_ORDERS_MIGRATION_HINT,
  isMissingColumnError,
} from "@/lib/supabase/errors";
import { requireScanAccess } from "@/lib/organizer/require-auth";
import { normalizeWhatsAppPhone } from "@/lib/tickets/whatsapp";
import {
  getPromoByCode,
  incrementPromoUses,
  validatePromoForCheckout,
  type PromoPreview,
} from "@/lib/promo/codes";
import { getPublicEventBySlug } from "@/lib/data/events";
import {
  parseCheckoutForm,
  parseTierSelections,
  formatZodError,
} from "@/lib/validation/parse";
import {
  eventSlugSchema,
  promoPreviewInputSchema,
} from "@/lib/validation/schemas";
import {
  loadTicketForCheckIn,
  parseCheckInScan,
  validateTicketOtpForCheckIn,
} from "@/lib/tickets/check-in";

export type ClaimState = {
  error?: string;
};

type TierSelection = Record<string, number>;

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
): Promise<
  | {
      lineItems: LineItem[];
      subtotalAmount: number;
      serviceFee: number;
      bookingFee: number;
      totalAmount: number;
    }
  | { error: string }
> {
  const { data: tierRows } = await supabase
    .from("ticket_tiers")
    .select("id, name, price, capacity, sold")
    .eq("event_slug", eventSlug);

  if (!tierRows?.length) return { error: "No ticket tiers available." };

  const tierMap = new Map(
    tierRows.map((tier) => [tier.id as string, tier as TicketTier & { sold: number }]),
  );

  let subtotalAmount = 0;
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

    subtotalAmount += Number(tier.price) * qty;
    lineItems.push({
      tierId,
      tierName: tier.name,
      qty,
      price: Number(tier.price),
    });
  }

  const amounts = computeOrderAmounts(
    lineItems.map((item) => ({ price: item.price, quantity: item.qty })),
    lineItems.reduce((sum, item) => sum + item.qty, 0),
  );

  return {
    lineItems,
    subtotalAmount: amounts.subtotalAmount,
    serviceFee: amounts.serviceFee,
    bookingFee: amounts.bookingFee,
    totalAmount: amounts.totalAmount,
  };
}

type OrderInsertRow = {
  event_slug: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string | null;
  user_id?: string | null;
  subtotal_amount: number;
  service_fee: number;
  booking_fee?: number;
  total_amount: number;
  discount_amount?: number;
  promo_code_id?: string | null;
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
    if (message.includes("subtotal_amount") && "subtotal_amount" in rowToInsert) {
      const { subtotal_amount: _subtotal, ...rest } = rowToInsert;
      rowToInsert = rest;
      continue;
    }
    if (message.includes("service_fee") && "service_fee" in rowToInsert) {
      const { service_fee: _fee, ...rest } = rowToInsert;
      rowToInsert = rest;
      continue;
    }
    if (message.includes("booking_fee") && "booking_fee" in rowToInsert) {
      const { booking_fee: _bookingFee, ...rest } = rowToInsert;
      rowToInsert = rest;
      continue;
    }
    if (message.includes("discount_amount") && "discount_amount" in rowToInsert) {
      const { discount_amount: _discount, ...rest } = rowToInsert;
      rowToInsert = rest;
      continue;
    }
    if (message.includes("promo_code_id") && "promo_code_id" in rowToInsert) {
      const { promo_code_id: _promo, ...rest } = rowToInsert;
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

export async function previewPromoCode(
  eventSlug: string,
  rawCode: string,
  selectionsRaw: string,
): Promise<{ preview?: PromoPreview; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { error: "Promo codes require Supabase." };
  }

  const input = promoPreviewInputSchema.safeParse({
    eventSlug,
    rawCode,
    selectionsRaw,
  });
  if (!input.success) {
    return { error: formatZodError(input.error) };
  }

  const parsedSelections = parseTierSelections(input.data.selectionsRaw);
  if (!parsedSelections.ok) {
    return { error: parsedSelections.error };
  }

  const chosen = Object.entries(parsedSelections.data).filter(([, qty]) => qty > 0);

  const built = await buildLineItems(supabase, input.data.eventSlug, chosen);
  if ("error" in built) return { error: built.error };

  const promo = await getPromoByCode(
    supabase,
    input.data.eventSlug,
    input.data.rawCode,
  );
  if (!promo) return { error: "Invalid promo code." };

  const validation = validatePromoForCheckout(
    promo,
    input.data.eventSlug,
    built.subtotalAmount,
  );
  if (!validation.ok) return { error: validation.error };

  const amounts = computeOrderAmountsWithDiscount(
    built.lineItems.map((item) => ({ price: item.price, quantity: item.qty })),
    promo,
    built.lineItems.reduce((sum, item) => sum + item.qty, 0),
  );

  return {
    preview: {
      code: promo.code,
      promoCodeId: promo.id,
      discountAmount: amounts.discountAmount,
      subtotalAmount: amounts.subtotalAmount,
      ticketAmount: amounts.ticketAmount,
      bookingFee: amounts.bookingFee,
      totalAmount: amounts.totalAmount,
      serviceFee: amounts.serviceFee,
    },
  };
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

  const parsedForm = parseCheckoutForm(formData);
  if (!parsedForm.ok) {
    return { error: parsedForm.error };
  }

  const {
    eventSlug,
    buyerName,
    buyerEmail,
    buyerPhone: buyerPhoneRaw,
    whatsappOptIn,
    promoCode: rawPromoCode,
    selectionsRaw,
  } = parsedForm.data;

  const parsedSelections = parseTierSelections(selectionsRaw);
  if (!parsedSelections.ok) {
    return { error: parsedSelections.error };
  }
  const selections: TierSelection = parsedSelections.data;

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

  const chosen = Object.entries(selections).filter(([, qty]) => qty > 0);

  const publicEvent = await getPublicEventBySlug(eventSlug);
  if (!publicEvent) return { error: "Event not found." };

  const totalTickets = chosen.reduce((sum, [, qty]) => sum + qty, 0);

  const built = await buildLineItems(supabase, eventSlug, chosen);
  if ("error" in built) return { error: built.error };

  let { lineItems, subtotalAmount, serviceFee, bookingFee, totalAmount } = built;
  let discountAmount = 0;
  let promoCodeId: string | null = null;

  if (rawPromoCode) {
    const promo = await getPromoByCode(supabase, eventSlug, rawPromoCode);
    if (!promo) return { error: "Invalid promo code." };

    const validation = validatePromoForCheckout(
      promo,
      eventSlug,
      subtotalAmount,
    );
    if (!validation.ok) return { error: validation.error };

    const amounts = computeOrderAmountsWithDiscount(
      lineItems.map((item) => ({ price: item.price, quantity: item.qty })),
      promo,
      totalTickets,
    );
    subtotalAmount = amounts.subtotalAmount;
    discountAmount = amounts.discountAmount;
    serviceFee = amounts.serviceFee;
    bookingFee = amounts.bookingFee;
    totalAmount = amounts.totalAmount;
    promoCodeId = promo.id;
  }

  const orderDiscountFields = {
    discount_amount: discountAmount,
    promo_code_id: promoCodeId,
  };

  if (totalAmount > 0 && isPayfastConfigured()) {
    const orderResult = await insertOrderRow(supabase, {
      event_slug: eventSlug,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone,
      user_id: userId,
      subtotal_amount: subtotalAmount,
      service_fee: serviceFee,
      booking_fee: bookingFee,
      total_amount: totalAmount,
      ...orderDiscountFields,
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
    subtotal_amount: subtotalAmount,
    service_fee: serviceFee,
    booking_fee: bookingFee,
    total_amount: totalAmount,
    ...orderDiscountFields,
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

  if (promoCodeId) {
    const promoResult = await incrementPromoUses(supabase, promoCodeId);
    if (!promoResult.ok) {
      return { error: promoResult.error };
    }
  }

  revalidateTicketPaths(eventSlug);
  redirect(`/tickets/${order.id}`);
}

export async function checkInTicket(rawScan: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { code: normalized, otp } = parseCheckInScan(rawScan);
  if (!normalized) {
    return { ok: false, error: "Ticket not found." };
  }

  const ticket = await loadTicketForCheckIn(supabase, normalized);
  if (!ticket) return { ok: false, error: "Ticket not found." };

  const otpValidation = validateTicketOtpForCheckIn(ticket, otp);
  if (!otpValidation.ok) {
    return { ok: false, error: otpValidation.error };
  }

  const eventSlug = ticket.event_slug;
  const scanAccess = await requireScanAccess(eventSlug);
  if ("error" in scanAccess) {
    return { ok: false, error: scanAccess.error };
  }

  const rateLimit = await enforceCheckInRateLimit(scanAccess.session.email);
  if (!rateLimit.ok) {
    return { ok: false, error: rateLimit.error };
  }

  if (ticket.status === "used") {
    return { ok: false, error: "Already checked in." };
  }
  if (ticket.status !== "valid") {
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

export async function toggleEventFollow(eventSlug: string): Promise<{
  error?: string;
  following?: boolean;
}> {
  if (!isFanAuthConfigured()) {
    return { error: "Sign in is not configured." };
  }

  const user = await getFanUser();
  if (!user) {
    const organizerSession = await getOrganizerSession();
    if (organizerSession) {
      return {
        error:
          "Sign out as organizer and sign in with a fan account to follow events.",
      };
    }
    return { error: "Sign in to follow events." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { error: "Follows require Supabase." };
  }

  const slugResult = eventSlugSchema.safeParse(eventSlug);
  if (!slugResult.success) {
    return { error: "Event not found." };
  }
  const slug = slugResult.data;

  const { data: existing } = await supabase
    .from("event_follows")
    .select("event_slug")
    .eq("user_id", user.id)
    .eq("event_slug", slug)
    .maybeSingle();

  if (existing) {
    const result = await unfollowEvent(user.id, slug);
    if (!result.ok) return { error: result.error };

    revalidatePath(`/events/${slug}`);
    revalidatePath("/account");
    return { following: false };
  }

  const result = await followEvent(user.id, slug);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/events/${slug}`);
  revalidatePath("/account");
  return { following: true };
}
