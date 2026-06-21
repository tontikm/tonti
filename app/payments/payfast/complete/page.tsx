import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PayfastCompletePoller } from "@/components/payments/PayfastCompletePoller";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/Button";

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function PayfastCompletePage({ searchParams }: Props) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, event_slug")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) notFound();

  if (order.status === "confirmed") {
    redirect(`/tickets/${order.id}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <PayfastCompletePoller orderId={orderId} />
      <h1 className="text-2xl font-bold">Payment processing</h1>
      <p className="mt-3 text-sm text-muted">
        Payfast is confirming your payment. This usually takes a few seconds.
        Refresh this page or check your email shortly.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href={`/payments/payfast/complete?orderId=${orderId}`}>
          Refresh status
        </Button>
        <Button href={`/events/${order.event_slug}`} variant="secondary">
          Back to event
        </Button>
      </div>
      <p className="mt-6 text-xs text-muted">
        Paid but no tickets?{" "}
        <Link href="/help" className="text-foreground hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  );
}
