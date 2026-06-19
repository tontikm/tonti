import type { EventCategory, EventTicket } from "@/lib/types";
import { TicketQr } from "@/components/tickets/TicketQr";

const ACCENT_COLORS: Record<EventCategory, string> = {
  nightlife: "#a78bfa",
  festival: "#fb923c",
  music: "#22d3ee",
  lifestyle: "#f472b6",
};

type TicketPassCardProps = {
  ticket: EventTicket;
  index: number;
  total: number;
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
  index,
  total,
  category = "nightlife",
  showDivider = false,
}: TicketPassCardProps) {
  const accent = ACCENT_COLORS[category];
  const status = statusLabel(ticket.status);

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

      <div className="flex flex-col gap-6 p-6 pl-8 sm:flex-row sm:items-center sm:justify-between">
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
            {ticket.code}
          </p>
          <p className="mt-1 text-sm text-muted">{ticket.holderName}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted">
            Ticket {index + 1} of {total}
          </p>
        </div>

        <div className="shrink-0 self-center sm:self-auto">
          <TicketQr code={ticket.code} size={168} />
        </div>
      </div>
    </div>
  );
}
