import Link from "next/link";
import type { CheckoutCart } from "@/lib/checkout";
import type { Event } from "@/lib/types";
import type { PromoPreview } from "@/lib/promo/codes";
import { formatPrice } from "@/lib/utils";

type CheckoutSummaryCompactProps = {
  event: Event;
  cart: CheckoutCart;
  promo?: PromoPreview | null;
};

export function CheckoutSummaryCompact({
  event,
  cart,
  promo,
}: CheckoutSummaryCompactProps) {
  const total = promo?.totalAmount ?? cart.checkoutTotal;
  const isFree = total === 0;
  const ticketLabel =
    cart.totalTickets === 1 ? "1 ticket" : `${cart.totalTickets} tickets`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{event.title}</p>
          <p className="mt-1 text-sm text-muted">{ticketLabel}</p>
        </div>
        <p className="shrink-0 text-lg font-bold">
          {isFree ? "Free" : formatPrice(total)}
        </p>
      </div>
      <Link
        href={`/events/${event.slug}`}
        className="mt-3 inline-block text-sm text-muted hover:text-foreground"
      >
        ← Change tickets
      </Link>
    </div>
  );
}
