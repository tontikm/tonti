"use client";

import { useState } from "react";
import Image from "next/image";
import type { EventCategory, EventTicket } from "@/lib/types";
import { RotatingTicketQr } from "@/components/tickets/RotatingTicketQr";
import { getSafeEventImageUrl } from "@/lib/images";
import { maskTicketCode } from "@/lib/tickets/rotating-qr";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_SRC, BRAND_LOGO_WIDTH, BRAND_NAME } from "@/lib/site";

const ACCENT_COLORS: Record<EventCategory, string> = {
  nightlife: "#a78bfa",
  festival: "#fb923c",
  music: "#22d3ee",
  lifestyle: "#f472b6",
};

type TicketPassCardProps = {
  ticket: EventTicket;
  totpSecret: string;
  index: number;
  total: number;
  eventImage: string;
  eventTitle?: string;
  category?: EventCategory;
  showDivider?: boolean;
};

function statusLabel(status: EventTicket["status"]): string | null {
  if (status === "valid") return null;
  if (status === "used") return "Checked in";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function TicketPassCard({
  ticket,
  totpSecret,
  index,
  total,
  eventImage,
  eventTitle,
  category = "nightlife",
  showDivider = false,
}: TicketPassCardProps) {
  const accent = ACCENT_COLORS[category];
  const status = statusLabel(ticket.status);
  const [showCode, setShowCode] = useState(false);
  const canShowLiveQr = ticket.status === "valid" && Boolean(totpSecret);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] ${
        showDivider ? "border-b border-dashed border-white/15 pb-8 sm:border-b-0 sm:pb-0" : ""
      }`}
    >
      <div
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: `linear-gradient(180deg, ${accent}, ${accent}88)` }}
        aria-hidden
      />

      <div className="flex justify-center border-b border-white/10 px-6 py-3 pl-8">
        <Image
          src={BRAND_LOGO_SRC}
          alt={BRAND_NAME}
          width={BRAND_LOGO_WIDTH}
          height={BRAND_LOGO_HEIGHT}
          className="h-7 w-auto object-contain"
        />
      </div>

      <div className="flex flex-col gap-6 p-6 pl-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10">
            <Image
              src={getSafeEventImageUrl(eventImage)}
              alt={eventTitle ?? ""}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: `${accent}22`,
                  color: accent,
                }}
              >
                {ticket.tierName}
              </span>
              {status ? (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-muted">
                  {status}
                </span>
              ) : null}
            </div>

            <p className="mt-3 font-mono text-lg font-semibold tracking-wide">
              {showCode ? ticket.code : maskTicketCode(ticket.code)}
            </p>
            {!showCode && canShowLiveQr ? (
              <button
                type="button"
                onClick={() => setShowCode(true)}
                className="mt-1 text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
              >
                Show code for manual entry
              </button>
            ) : null}
            <p className="mt-1 text-sm text-muted">{ticket.holderName}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted">
              Ticket {index + 1} of {total}
            </p>
          </div>
        </div>

        <div className="shrink-0 self-center sm:self-auto">
          {canShowLiveQr ? (
            <RotatingTicketQr
              code={ticket.code}
              totpSecret={totpSecret}
              size={168}
            />
          ) : (
            <p className="max-w-[12rem] text-center text-sm text-muted">
              {ticket.status === "used"
                ? "This ticket has already been checked in."
                : "Live entry QR unavailable."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
