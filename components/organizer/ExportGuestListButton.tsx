"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import type { EventTicketWithBuyer } from "@/lib/types";
import { formatEventTime } from "@/lib/utils";

type ExportGuestListButtonProps = {
  eventTitle: string;
  tickets: EventTicketWithBuyer[];
};

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function ExportGuestListButton({
  eventTitle,
  tickets,
}: ExportGuestListButtonProps) {
  const [exporting, setExporting] = useState(false);

  const rows = useMemo(
    () =>
      tickets.map((ticket) => [
        ticket.holderName,
        ticket.buyerName,
        ticket.buyerEmail,
        ticket.tierName,
        ticket.code,
        ticket.status,
        ticket.checkedInAt ? formatEventTime(ticket.checkedInAt) : "",
      ]),
    [tickets],
  );

  function handleExport() {
    setExporting(true);
    try {
      const header = [
        "Holder name",
        "Buyer name",
        "Buyer email",
        "Tier",
        "Ticket code",
        "Status",
        "Checked in at",
      ];
      const csv = [header, ...rows]
        .map((line) => line.map(escapeCsvCell).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const slug = eventTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      anchor.href = url;
      anchor.download = `${slug || "guest-list"}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={tickets.length === 0 || exporting}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm transition-colors hover:border-foreground/40 hover:bg-surface-hover disabled:opacity-50"
    >
      <Download className="h-4 w-4" aria-hidden />
      {exporting ? "Exporting…" : "Export CSV"}
    </button>
  );
}
