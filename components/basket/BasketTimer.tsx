"use client";

import { Clock } from "lucide-react";
import { useBasket } from "@/components/basket/BasketProvider";
import { formatBasketCountdown } from "@/lib/basket/timer";
import { cn } from "@/lib/utils";

type BasketTimerProps = {
  variant?: "inline" | "prominent";
  className?: string;
};

export function BasketTimer({
  variant = "inline",
  className,
}: BasketTimerProps) {
  const { secondsRemaining, ticketCount } = useBasket();

  if (ticketCount === 0 || secondsRemaining === null) return null;

  const urgent = secondsRemaining <= 180;

  if (variant === "prominent") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
          urgent
            ? "border-amber-500/40 bg-amber-950/30 text-amber-100"
            : "border-white/10 bg-white/[0.03] text-muted",
          className,
        )}
      >
        <Clock className="h-4 w-4 shrink-0" />
        <span>
          Tickets reserved for{" "}
          <span className="font-mono font-semibold text-foreground">
            {formatBasketCountdown(secondsRemaining)}
          </span>
        </span>
      </div>
    );
  }

  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        urgent ? "text-amber-200" : "text-muted",
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      Reserved ·{" "}
      <span className="font-mono">{formatBasketCountdown(secondsRemaining)}</span>
    </p>
  );
}
