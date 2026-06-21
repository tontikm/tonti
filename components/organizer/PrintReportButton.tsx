"use client";

import { Printer } from "lucide-react";

export function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm transition-colors hover:border-foreground/40 hover:bg-surface-hover print:hidden"
    >
      <Printer className="h-4 w-4" aria-hidden />
      Print / Save PDF
    </button>
  );
}
