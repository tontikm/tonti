import { notFound, redirect } from "next/navigation";
import { PayfastRedirectForm } from "@/components/payments/PayfastRedirectForm";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isPayfastConfigured } from "@/lib/payments/config";
import { buildPayfastCheckout } from "@/lib/payments/payfast";

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function PayfastStartPage({ searchParams }: Props) {
  if (!isPayfastConfigured()) {
    redirect("/events");
  }

  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select("id, event_slug, buyer_name, buyer_email, total_amount, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.status !== "pending_payment") {
    notFound();
  }

  const { data: event } = await supabase
    .from("events")
    .select("title")
    .eq("slug", order.event_slug)
    .maybeSingle();

  const checkout = buildPayfastCheckout({
    orderId: order.id as string,
    eventSlug: order.event_slug as string,
    amount: Number(order.total_amount),
    itemName: (event?.title as string) ?? "Spotra tickets",
    buyerName: order.buyer_name as string,
    buyerEmail: order.buyer_email as string,
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Redirecting to Payfast…</h1>
      <p className="mt-3 text-sm text-muted">
        Secure payment for your tickets. Please wait.
      </p>
      <PayfastRedirectForm action={checkout.action} fields={checkout.fields} />
    </div>
  );
}
