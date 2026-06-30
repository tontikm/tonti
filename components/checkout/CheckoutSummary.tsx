import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import type { CheckoutCart } from "@/lib/checkout";
import type { Event } from "@/lib/types";
import type { PromoPreview } from "@/lib/promo/codes";
import { getSafeEventImageUrl } from "@/lib/images";
import { BOOKING_FEE_PER_TICKET } from "@/lib/payments/service-fee";
import { formatDateRange, formatEventTime, formatPrice } from "@/lib/utils";

type CheckoutSummaryProps = {
  event: Event;
  cart: CheckoutCart;
  promo?: PromoPreview | null;
  payfastEnabled?: boolean;
};

function resolveCheckoutTotals(
  cart: CheckoutCart,
  promo?: PromoPreview | null,
) {
  const subtotal = promo?.subtotalAmount ?? cart.totalAmount;
  const ticketAmount = promo?.ticketAmount ?? cart.totalAmount;
  const bookingFee = promo?.bookingFee ?? cart.bookingFee;
  const total = promo?.totalAmount ?? cart.checkoutTotal;
  return { subtotal, ticketAmount, bookingFee, total };
}

export function CheckoutSummary({
  event,
  cart,
  promo,
  payfastEnabled = false,
}: CheckoutSummaryProps) {
  const { subtotal, ticketAmount, bookingFee, total } = resolveCheckoutTotals(
    cart,
    promo,
  );
  const isFree = total === 0;
  const showPromoDiscount = promo && promo.discountAmount > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl border border-white/10">
        <Image
          src={getSafeEventImageUrl(event.image)}
          alt=""
          fill
          className="object-cover"
          sizes="400px"
        />
      </div>

      <h2 className="text-lg font-semibold leading-tight">{event.title}</h2>

      <div className="mt-3 space-y-2 text-sm text-muted">
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          {event.endDate
            ? formatDateRange(event.date, event.endDate)
            : `${formatDateRange(event.date)} · ${formatEventTime(event.showTime)}`}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          {event.venue.name}, {event.venue.city}
        </p>
      </div>

      <div className="mt-6 border-t border-white/10 pt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Order summary
        </h3>
        <ul className="mt-4 space-y-3">
          {cart.lines.map((line) => (
            <li
              key={line.tierId}
              className="flex items-start justify-between gap-4 text-sm"
            >
              <div>
                <p className="font-medium">{line.tierName}</p>
                <p className="text-muted">
                  {line.quantity} × {line.price === 0 ? "Free" : formatPrice(line.price)}
                </p>
              </div>
              <span className="shrink-0 font-medium">
                {line.lineTotal === 0 ? "Free" : formatPrice(line.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        {showPromoDiscount && (
          <div className="mt-4 flex items-center justify-between text-sm text-emerald-300">
            <span>
              Promo <span className="font-mono">{promo.code}</span>
            </span>
            <span>-{formatPrice(promo.discountAmount)}</span>
          </div>
        )}

        {!isFree && bookingFee > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted">
              Booking Fee ({cart.totalTickets} × {formatPrice(BOOKING_FEE_PER_TICKET)})
            </span>
            <span className="font-medium">{formatPrice(bookingFee)}</span>
          </div>
        )}

        {showPromoDiscount && ticketAmount !== subtotal && (
          <div className="mt-2 flex items-center justify-between text-sm text-muted">
            <span>Tickets after discount</span>
            <span>{formatPrice(ticketAmount)}</span>
          </div>
        )}

        <div className="mt-4 hidden items-center justify-between border-t border-white/10 pt-4 lg:flex">
          <span className="font-medium">Total</span>
          <span className="text-xl font-bold">
            {isFree ? "Free" : formatPrice(total)}
          </span>
        </div>

        {!isFree && subtotal > 0 && (
          <p className="mt-3 text-xs text-muted">
            {payfastEnabled
              ? "You'll pay securely via Payfast. QR tickets are issued after payment confirms."
              : "No online payment on this checkout. Settle at the venue unless the organizer states otherwise."}
          </p>
        )}
      </div>

      <Link
        href={`/events/${event.slug}`}
        className="mt-6 inline-block text-sm text-muted hover:text-foreground"
      >
        ← Change tickets
      </Link>
    </div>
  );
}
