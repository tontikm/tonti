"use client";

import type { ReactNode } from "react";

type StickyPurchaseBarProps = {
  visible: boolean;
  ticketCount: number;
  totalLabel: string;
  subtitle?: string;
  action: ReactNode;
};

export function StickyPurchaseBar({
  visible,
  ticketCount,
  totalLabel,
  subtitle,
  action,
}: StickyPurchaseBarProps) {
  if (!visible) return null;

  const ticketLabel = `${ticketCount} ticket${ticketCount !== 1 ? "s" : ""}`;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-sm text-muted">Total ({ticketLabel})</p>
          <p className="text-xl font-bold text-emerald-400 sm:text-2xl">
            {totalLabel}
          </p>
          {subtitle ? (
            <p className="mt-0.5 hidden text-xs text-muted sm:block">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    </div>
  );
}
