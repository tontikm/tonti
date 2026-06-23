"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import type { OrganizerPayoutSummary } from "@/lib/admin/payouts";

type ExportPayoutsCsvButtonProps = {
  summaries: OrganizerPayoutSummary[];
};

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAddress(row: OrganizerPayoutSummary): string {
  return [
    row.invoiceAddressLine1,
    row.invoiceAddressLine2,
    row.invoiceCity,
    row.invoiceProvince,
    row.invoicePostalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export function ExportPayoutsCsvButton({
  summaries,
}: ExportPayoutsCsvButtonProps) {
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);
    try {
      const header = [
        "Organizer name",
        "Email",
        "Company",
        "Address",
        "VAT number",
        "Amount owed",
        "Paid out",
        "Outstanding",
      ];
      const rows = summaries
        .filter((row) => row.outstanding > 0)
        .map((row) => [
          row.name ?? "",
          row.email,
          row.invoiceCompanyName ?? "",
          formatAddress(row),
          row.vatNumber ?? "",
          row.organizerOwed.toFixed(2),
          row.paidOut.toFixed(2),
          row.outstanding.toFixed(2),
        ]);

      const csv = [header, ...rows]
        .map((line) => line.map(escapeCsvCell).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `spotra-payouts-${new Date().toISOString().slice(0, 10)}.csv`;
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
      disabled={exporting}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface px-4 py-2 text-sm transition-colors hover:border-foreground/40 hover:bg-surface-hover disabled:opacity-50"
    >
      <Download className="h-4 w-4" aria-hidden />
      {exporting ? "Exporting…" : "Export CSV"}
    </button>
  );
}
