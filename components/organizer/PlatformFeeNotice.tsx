"use client";

import { Percent } from "lucide-react";
import { SERVICE_FEE_RATE } from "@/lib/payments/service-fee";

type PlatformFeeNoticeProps = {
  variant?: "banner" | "inline";
  className?: string;
};

export function PlatformFeeNotice({
  variant = "inline",
  className = "",
}: PlatformFeeNoticeProps) {
  const feePercent = Math.round(SERVICE_FEE_RATE * 100);

  if (variant === "banner") {
    return (
      <div
        className={`rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-4 sm:px-5 ${className}`}
      >
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Spotra platform fee: {feePercent}% per paid ticket
            </p>
            <p className="mt-1 text-sm text-muted">
              Fans pay your listed ticket price. The {feePercent}% fee applies
              only to paid tiers. Free RSVPs are excluded, and the fee is deducted
              from your side, not added to the fan&apos;s price.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-muted ${className}`}
    >
      <p>
        <span className="font-medium text-foreground">
          {feePercent}% per paid ticket
        </span>
        . Fans pay your listed price; the fee is deducted from your side. Free
        tiers are excluded.
      </p>
    </div>
  );
}
