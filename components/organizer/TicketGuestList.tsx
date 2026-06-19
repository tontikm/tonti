"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Search } from "lucide-react";
import type { EventTicketWithBuyer } from "@/lib/types";
import { formatEventTime } from "@/lib/utils";

type TicketGuestListProps = {
  eventSlug: string;
  tickets: EventTicketWithBuyer[];
};

export function TicketGuestList({ eventSlug, tickets }: TicketGuestListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;

    return tickets.filter((ticket) => {
      return (
        ticket.holderName.toLowerCase().includes(q) ||
        ticket.buyerName.toLowerCase().includes(q) ||
        ticket.buyerEmail.toLowerCase().includes(q) ||
        ticket.code.toLowerCase().includes(q) ||
        ticket.tierName.toLowerCase().includes(q)
      );
    });
  }, [query, tickets]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, or ticket code…"
          className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none"
        />
      </div>

      <p className="mt-3 text-sm text-muted">
        {filtered.length} of {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface/50 px-4 py-10 text-center text-sm text-muted">
          {tickets.length === 0
            ? "No RSVPs yet. Share the event link so fans can claim free tickets."
            : "No tickets match your search."}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
          {filtered.map((ticket) => (
            <li key={ticket.id} className="px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{ticket.holderName}</p>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{ticket.buyerEmail}</p>
                  <p className="mt-1 text-sm text-muted">
                    {ticket.tierName} ·{" "}
                    <span className="font-mono text-xs">{ticket.code}</span>
                  </p>
                  {ticket.checkedInAt && (
                    <p className="mt-1 text-xs text-muted">
                      Checked in {formatEventTime(ticket.checkedInAt)}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/tickets/verify/${ticket.code}`}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                  >
                    View
                  </Link>
                  {ticket.status === "valid" && (
                    <Link
                      href={`/organizer/events/${eventSlug}/scan?code=${encodeURIComponent(ticket.code)}`}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black"
                    >
                      Check in
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "used") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        In
      </span>
    );
  }

  if (status === "valid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  }

  return (
    <span className="rounded-full border border-red-500/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-400">
      {status}
    </span>
  );
}
