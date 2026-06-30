import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/server-auth";
import { canUserAccessOrder } from "@/lib/fan/orders";
import type { FanUser } from "@/lib/auth/session";
import type { TicketOrder } from "@/lib/types";
import { orderIdSchema } from "@/lib/validation/schemas";

function mapOrderRow(row: Record<string, unknown>): TicketOrder {
  const totalAmount = Number(row.total_amount ?? 0);
  const subtotalAmount = Number(row.subtotal_amount ?? totalAmount);
  return {
    id: row.id as string,
    eventSlug: row.event_slug as string,
    buyerName: row.buyer_name as string,
    buyerEmail: row.buyer_email as string,
    subtotalAmount,
    serviceFee: Number(row.service_fee ?? 0),
    bookingFee: Number(row.booking_fee ?? 0),
    totalAmount,
    ticketCount: Number(row.ticket_count ?? 0),
    status: row.status as string,
    createdAt: row.created_at as string,
    userId: (row.user_id as string) ?? undefined,
    buyerPhone: (row.buyer_phone as string) ?? undefined,
    paymentProvider: (row.payment_provider as string) ?? undefined,
    paymentReference: (row.payment_reference as string) ?? undefined,
  };
}

export async function getOrderForTicketPage(
  orderId: string,
  user: FanUser,
): Promise<TicketOrder | null> {
  if (!orderIdSchema.safeParse(orderId).success) return null;

  const auth = await createAuthClient();
  if (auth) {
    const { data } = await auth
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (data) {
      const order = mapOrderRow(data);
      return canUserAccessOrder(user, order) ? order : null;
    }
  }

  const supabase = getSupabaseAdmin() ?? getSupabaseServer();
  if (!supabase) return null;

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (!data) return null;

  const order = mapOrderRow(data);
  return canUserAccessOrder(user, order) ? order : null;
}
