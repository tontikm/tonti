import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeOrderAmountsWithDiscount,
  type FeeLine,
} from "@/lib/payments/service-fee";

export type PromoDiscountType = "percent" | "fixed";

export type PromoCodeRow = {
  id: string;
  event_slug: string;
  code: string;
  discount_type: PromoDiscountType;
  discount_value: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  active: boolean;
};

export type PromoCode = {
  id: string;
  eventSlug: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  active: boolean;
};

export type PromoPreview = {
  code: string;
  promoCodeId: string;
  discountAmount: number;
  subtotalAmount: number;
  ticketAmount: number;
  bookingFee: number;
  totalAmount: number;
  serviceFee: number;
};

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

function mapPromoRow(row: Record<string, unknown>): PromoCode {
  return {
    id: row.id as string,
    eventSlug: row.event_slug as string,
    code: row.code as string,
    discountType: row.discount_type as PromoDiscountType,
    discountValue: Number(row.discount_value),
    maxUses: row.max_uses == null ? null : Number(row.max_uses),
    usesCount: Number(row.uses_count ?? 0),
    expiresAt: (row.expires_at as string) ?? null,
    active: Boolean(row.active),
  };
}

export function computeDiscountAmount(
  subtotalAmount: number,
  promo: Pick<PromoCode, "discountType" | "discountValue">,
): number {
  if (subtotalAmount <= 0) return 0;

  let discount =
    promo.discountType === "percent"
      ? Math.round(subtotalAmount * (promo.discountValue / 100) * 100) / 100
      : promo.discountValue;

  return Math.min(subtotalAmount, Math.max(0, discount));
}

export function validatePromoForCheckout(
  promo: PromoCode,
  eventSlug: string,
  subtotalAmount: number,
): { ok: true } | { ok: false; error: string } {
  if (promo.eventSlug !== eventSlug) {
    return { ok: false, error: "This code is not valid for this event." };
  }
  if (!promo.active) {
    return { ok: false, error: "This promo code is no longer active." };
  }
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { ok: false, error: "This promo code has expired." };
  }
  if (promo.maxUses != null && promo.usesCount >= promo.maxUses) {
    return { ok: false, error: "This promo code has reached its usage limit." };
  }
  if (subtotalAmount <= 0) {
    return { ok: false, error: "Promo codes apply to paid tickets only." };
  }

  const discount = computeDiscountAmount(subtotalAmount, promo);
  if (discount <= 0) {
    return { ok: false, error: "This promo code does not apply to your order." };
  }

  return { ok: true };
}

export function buildPromoPreview(
  promo: PromoCode,
  lines: FeeLine[],
): PromoPreview {
  const amounts = computeOrderAmountsWithDiscount(lines, promo);
  return {
    code: promo.code,
    promoCodeId: promo.id,
    discountAmount: amounts.discountAmount,
    subtotalAmount: amounts.subtotalAmount,
    ticketAmount: amounts.ticketAmount,
    bookingFee: amounts.bookingFee,
    totalAmount: amounts.totalAmount,
    serviceFee: amounts.serviceFee,
  };
}

export async function getPromoByCode(
  supabase: SupabaseClient,
  eventSlug: string,
  rawCode: string,
): Promise<PromoCode | null> {
  const code = normalizePromoCode(rawCode);
  if (!code) return null;

  const { data } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("event_slug", eventSlug)
    .eq("code", code)
    .maybeSingle();

  return data ? mapPromoRow(data) : null;
}

export async function getEventPromoCodes(
  supabase: SupabaseClient,
  eventSlug: string,
): Promise<PromoCode[]> {
  const { data } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("event_slug", eventSlug)
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapPromoRow);
}

export async function incrementPromoUses(
  supabase: SupabaseClient,
  promoId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: promo } = await supabase
    .from("promo_codes")
    .select("uses_count, max_uses")
    .eq("id", promoId)
    .maybeSingle();

  if (!promo) return { ok: false, error: "Promo code not found." };

  const uses = Number(promo.uses_count ?? 0);
  const maxUses =
    promo.max_uses == null ? null : Number(promo.max_uses);

  if (maxUses != null && uses >= maxUses) {
    return { ok: false, error: "This promo code has reached its usage limit." };
  }

  const { error } = await supabase
    .from("promo_codes")
    .update({ uses_count: uses + 1 })
    .eq("id", promoId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
