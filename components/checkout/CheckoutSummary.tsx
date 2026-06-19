import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ShieldAlert } from "lucide-react";
import type { CheckoutCart } from "@/lib/checkout";
import type { Event } from "@/lib/types";
import { getSafeEventImageUrl } from "@/lib/images";
import { formatDateRange, formatEventTime, formatPrice } from "@/lib/utils";

type CheckoutSummaryProps = {
  event: Event;
  cart: CheckoutCart;
};

export function CheckoutSummary({ event, cart }: CheckoutSummaryProps) {
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
        {event.ageLimit != null && (
          <p className="flex items-center gap-2 text-amber-200/90">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            {event.ageLimit >= 18
              ? `${event.ageLimit}+ · Adults only — ID may be required`
              : `${event.ageLimit}+ age limit`}
          </p>
        )}
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

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="font-medium">Total</span>
          <span className="text-xl font-bold">
            {cart.isFree ? "Free" : formatPrice(cart.totalAmount)}
          </span>
        </div>

        {!cart.isFree && (
          <p className="mt-3 text-xs text-muted">
            No online payment on this checkout — settle at the venue unless the
            organizer states otherwise.
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
