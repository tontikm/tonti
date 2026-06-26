"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Search, Users } from "lucide-react";
import { OrganizerTicketDetailCard } from "@/components/organizer/OrganizerTicketDetailCard";
import type { OrganizerTicketDetail } from "@/components/organizer/OrganizerTicketDetailCard";
import type { EventTicketWithBuyer } from "@/lib/types";
import {
  filterTicketsByQuery,
  toOrganizerTicketDetail,
} from "@/lib/scanner/guest-search";
import { formatEventTime } from "@/lib/utils";

type ScannerGuestPanelProps = {
  eventSlug: string;
  tickets: EventTicketWithBuyer[];
  recentCheckIns: OrganizerTicketDetail[];
};

export function ScannerGuestPanel({
  eventSlug,
  tickets,
  recentCheckIns,
}: ScannerGuestPanelProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const searchResults = useMemo(
    () => filterTicketsByQuery(tickets, trimmedQuery).slice(0, 8),
    [tickets, trimmedQuery],
  );

  const listItems = trimmedQuery
    ? searchResults.map((ticket) => ({
        key: ticket.id,
        detail: toOrganizerTicketDetail(ticket),
      }))
    : recentCheckIns.map((detail) => ({
        key: detail.code,
        detail,
      }));

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4 text-muted" />
          Guest list
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted" />
        )}
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setExpandedCode(null);
              }}
              placeholder="Search name, email, or ticket code…"
              className="w-full rounded-xl border border-border bg-black/40 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none"
            />
          </div>

          <p className="mt-3 text-xs text-muted">
            {trimmedQuery
              ? `${searchResults.length} match${searchResults.length !== 1 ? "es" : ""}`
              : `${recentCheckIns.length} recent check-in${recentCheckIns.length !== 1 ? "s" : ""}`}
          </p>

          {listItems.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
              {trimmedQuery
                ? "No tickets match your search."
                : "No check-ins yet. Scanned guests will appear here."}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {listItems.map((item) => {
                const isExpanded = expandedCode === item.detail.code;
                return (
                  <li
                    key={item.key}
                    className="rounded-xl border border-border bg-black/20"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCode(isExpanded ? null : item.detail.code)
                      }
                      className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{item.detail.holderName}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {item.detail.tierName} ·{" "}
                          <span className="font-mono">{item.detail.code}</span>
                        </p>
                        {item.detail.checkedInAt ? (
                          <p className="mt-1 text-xs text-muted">
                            {formatEventTime(item.detail.checkedInAt)}
                          </p>
                        ) : null}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                      ) : (
                        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border px-3 pb-3">
                        <OrganizerTicketDetailCard
                          ticket={item.detail}
                          variant="plain"
                          className="mt-3 border-0 bg-transparent p-0"
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href={`/organizer/events/${eventSlug}/tickets?status=checked-in`}
            className="mt-4 inline-flex text-sm text-muted transition-colors hover:text-foreground"
          >
            View full guest list
          </Link>
        </div>
      )}
    </div>
  );
}
