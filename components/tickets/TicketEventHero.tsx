import Image from "next/image";
import { Calendar, Mail, MapPin, ShieldAlert } from "lucide-react";
import type { Event, TicketOrder } from "@/lib/types";
import { getSafeEventImageUrl } from "@/lib/images";
import {
  formatDateRange,
  formatEventTime,
  formatPrice,
} from "@/lib/utils";

type TicketEventHeroProps = {
  event: Event;
  order: TicketOrder;
};

export function TicketEventHero({ event, order }: TicketEventHeroProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={getSafeEventImageUrl(event.image)}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h2 className="text-2xl font-bold leading-tight">{event.title}</h2>
          <div className="mt-3 space-y-2 text-sm text-white/80">
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
        </div>
      </div>

      <div className="border-t border-white/10 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 text-sm text-muted">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              {order.buyerEmail}
            </p>
            <p>
              Order ref {order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Total
            </p>
            <p className="text-2xl font-bold">
              {order.totalAmount === 0 ? "Free" : formatPrice(order.totalAmount)}
            </p>
            {order.totalAmount > 0 && (
              <p className="mt-1 text-xs text-amber-200/90">
                Pay at the door — no online charge today
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
