"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Search } from "lucide-react";
import { OrganizerTicketDetailCard } from "@/components/organizer/OrganizerTicketDetailCard";
import type { EventTicketWithBuyer } from "@/lib/types";
import { formatEventTime } from "@/lib/utils";

type StatusFilter = "all" | "checked-in" | "pending";

type TicketGuestListProps = {
  eventSlug: string;
  tickets: EventTicketWithBuyer[];
  initialStatusFilter?: StatusFilter;
};

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "checked-in", label: "Checked in" },
  { value: "pending", label: "Pending" },
];

function parseStatusFilter(value: string | null): StatusFilter {
  if (value === "checked-in" || value === "pending") return value;
  return "all";
}

function matchesStatusFilter(ticket: EventTicketWithBuyer, filter: StatusFilter): boolean {
  if (filter === "checked-in") return ticket.status === "used";
  if (filter === "pending") return ticket.status === "valid";
  return true;
}

export function TicketGuestList({
  eventSlug,
  tickets,
  initialStatusFilter = "all",
}: TicketGuestListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialStatusFilter ?? parseStatusFilter(searchParams.get("status")),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function updateStatusFilter(next: StatusFilter) {
    setStatusFilter(next);
    setExpandedId(null);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("status");
    } else {
      params.set("status", next);
    }
    const queryString = params.toString();
    router.replace(
      queryString
        ? `/organizer/events/${eventSlug}/tickets?${queryString}`
        : `/organizer/events/${eventSlug}/tickets`,
      { scroll: false },
    );
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((ticket) => {
      if (!matchesStatusFilter(ticket, statusFilter)) return false;
      if (!q) return true;
      return (
        ticket.holderName.toLowerCase().includes(q) ||
        ticket.buyerName.toLowerCase().includes(q) ||
        ticket.buyerEmail.toLowerCase().includes(q) ||
        ticket.code.toLowerCase().includes(q) ||
        ticket.tierName.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter, tickets]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateStatusFilter(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === option.value
                ? "bg-white text-black"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative mt-4">
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
            : statusFilter === "checked-in"
              ? "No checked-in tickets yet."
              : statusFilter === "pending"
                ? "No pending tickets."
                : "No tickets match your search."}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
          {filtered.map((ticket) => {
            const isCheckedIn = ticket.status === "used";
            const isExpanded = expandedId === ticket.id;

            return (
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
                    {isCheckedIn && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : ticket.id)
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                      >
                        Details
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
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

                {isCheckedIn && isExpanded && (
                  <OrganizerTicketDetailCard
                    ticket={{
                      code: ticket.code,
                      holderName: ticket.holderName,
                      tierName: ticket.tierName,
                      buyerName: ticket.buyerName,
                      buyerEmail: ticket.buyerEmail,
                      checkedInAt: ticket.checkedInAt,
                    }}
                    className="mt-4"
                  />
                )}
              </li>
            );
          })}
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
