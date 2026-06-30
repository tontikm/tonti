import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPayfastMerchantId } from "@/lib/payments/config";
import {
  computeProcessingFee,
  mapPayfastPaymentMethod,
} from "@/lib/payments/processing-fees";
import { verifyPayfastItn } from "@/lib/payments/payfast";
import {
  fulfillTicketOrder,
  type LineItem,
} from "@/lib/tickets/fulfill-order";
import { incrementPromoUses } from "@/lib/promo/codes";
import { orderIdSchema, payfastItnSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return new Response("Server error", { status: 500 });
  }

  const formData = await request.formData();
  const fields: Array<[string, string]> = [];
  formData.forEach((value, key) => {
    fields.push([key, String(value)]);
  });
  const payload = Object.fromEntries(fields);

  if (!verifyPayfastItn(fields)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const itn = payfastItnSchema.safeParse(payload);
  if (!itn.success) {
    return new Response("Invalid", { status: 400 });
  }

  const configuredMerchantId = getPayfastMerchantId();
  if (
    configuredMerchantId &&
    itn.data.merchant_id &&
    itn.data.merchant_id !== configuredMerchantId
  ) {
    return new Response("Invalid merchant", { status: 400 });
  }

  const paymentStatus = itn.data.payment_status;
  const orderId = itn.data.m_payment_id;

  if (paymentStatus !== "COMPLETE") {
    if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", orderId)
        .eq("status", "pending_payment");
    }
    return new Response("OK");
  }

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, event_slug, buyer_name, status, selections, total_amount, promo_code_id",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return new Response("Order not found", { status: 404 });
  }

  if (order.status === "confirmed") {
    return new Response("OK");
  }

  const amountGross = Number(itn.data.amount_gross);
  const orderTotal = Number(order.total_amount ?? 0);
  if (
    !Number.isFinite(amountGross) ||
    Math.abs(amountGross - orderTotal) > 0.01
  ) {
    return new Response("Amount mismatch", { status: 400 });
  }

  const lineItems = (order.selections ?? []) as LineItem[];
  if (!lineItems.length) {
    return new Response("Invalid order data", { status: 400 });
  }

  const fulfilled = await fulfillTicketOrder(
    supabase,
    orderId,
    order.event_slug as string,
    order.buyer_name as string,
    lineItems,
  );

  if (!fulfilled.ok) {
    return new Response(fulfilled.error, { status: 500 });
  }

  const promoCodeId = order.promo_code_id as string | null;
  if (promoCodeId) {
    const promoResult = await incrementPromoUses(supabase, promoCodeId);
    if (!promoResult.ok) {
      return new Response(promoResult.error, { status: 500 });
    }
  }

  const processingMethod = mapPayfastPaymentMethod(itn.data.payment_method);
  const processingFee = computeProcessingFee(orderTotal, processingMethod);

  await supabase
    .from("orders")
    .update({
      status: "confirmed",
      payment_reference: itn.data.pf_payment_id ?? null,
      payment_method: itn.data.payment_method ?? null,
      processing_fee: processingFee,
    })
    .eq("id", orderId);

  revalidatePath(`/tickets/${orderId}`);
  revalidatePath(`/events/${order.event_slug}`);
  revalidatePath(`/events/${order.event_slug}/checkout`);
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/events", "layout");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payouts");

  return new Response("OK");
}
