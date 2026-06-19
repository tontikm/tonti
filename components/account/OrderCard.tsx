import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { formatEventDate, formatEventTime, formatPrice } from "@/lib/utils";

export function OrderCard({
  orderId,
  title,
  imageUrl,
  dateLabel,
  venueLabel,
  ticketCount,
  totalAmount,
  badge,
}: {
  orderId: string;
  title: string;
  imageUrl?: string | null;
  dateLabel: string;
  venueLabel: string;
  ticketCount: number;
  totalAmount: number;
  badge?: string;
}) {
  return (
    <Link
      href={`/tickets/${orderId}`}
      className="block rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20"
    >
      <div className="flex items-start gap-4">
        {imageUrl ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <p className="truncate text-lg font-semibold">{title}</p>
            {badge ? (
              <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                {badge}
              </span>
            ) : null}
          </div>
          <div className="mt-3 space-y-1.5 text-sm text-muted">
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              {dateLabel}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {venueLabel}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <Ticket className="h-4 w-4 shrink-0" />
        {ticketCount} ticket{ticketCount !== 1 ? "s" : ""} ·{" "}
        {totalAmount === 0 ? "Free" : formatPrice(totalAmount)}
      </p>
    </Link>
  );
}

export function NextUpCard({
  orderId,
  title,
  imageUrl,
  dateLabel,
  venueLabel,
  ticketCount,
}: {
  orderId: string;
  title: string;
  imageUrl?: string | null;
  dateLabel: string;
  venueLabel: string;
  ticketCount: number;
}) {
  return (
    <Link
      href={`/tickets/${orderId}`}
      className="block overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 transition-colors hover:border-emerald-500/50"
    >
      <div className="flex flex-col sm:flex-row">
        {imageUrl ? (
          <div className="relative aspect-[16/9] w-full sm:aspect-auto sm:h-auto sm:w-48 shrink-0">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:bg-gradient-to-r" />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col justify-center p-6">
          <span className="inline-flex w-fit rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Next up
          </span>
          <p className="mt-3 text-xl font-bold">{title}</p>
          <div className="mt-3 space-y-1.5 text-sm text-muted">
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              {dateLabel}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {venueLabel}
            </p>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-200/90">
            <Ticket className="h-4 w-4 shrink-0" />
            {ticketCount} ticket{ticketCount !== 1 ? "s" : ""} · View QR codes
          </p>
        </div>
      </div>
    </Link>
  );
}

export function EmptySection({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-white/15 px-5 py-8 text-center text-sm text-muted">
      {message}
    </p>
  );
}

export function ProfileSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="text-lg font-semibold">
        {title} <span className="text-muted">({count})</span>
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
