"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Ticket } from "lucide-react";
import type { TicketTier } from "@/lib/types";
import { buildCheckoutUrl } from "@/lib/checkout";
import { OrganizerFanAuthNotice } from "@/components/auth/OrganizerFanAuthNotice";
import { Button } from "@/components/ui/Button";
import { formatPrice, getTicketsRemaining } from "@/lib/utils";

type TicketTierSelectorProps = {
  eventSlug: string;
  eventTitle: string;
  tiers: TicketTier[];
  organizerEmail?: string | null;
};

export function TicketTierSelector({
  eventSlug,
  eventTitle,
  tiers,
  organizerEmail,
}: TicketTierSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQty = (tierId: string, delta: number, max: number) => {
    setQuantities((prev) => {
      const current = prev[tierId] ?? 0;
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [tierId]: next };
    });
  };

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = tiers.reduce((sum, tier) => {
    const qty = quantities[tier.id] ?? 0;
    return sum + tier.price * qty;
  }, 0);
  const checkoutUrl = useMemo(
    () => buildCheckoutUrl(eventSlug, quantities),
    [eventSlug, quantities],
  );
  const allSoldOut = tiers.every((tier) => getTicketsRemaining(tier) === 0);
  const purchaseDisabled = Boolean(organizerEmail);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <Ticket className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold">Get tickets</h2>
      </div>

      {organizerEmail && (
        <OrganizerFanAuthNotice
          organizerEmail={organizerEmail}
          fanLoginHref={`/login?next=${encodeURIComponent(buildCheckoutUrl(eventSlug, {}))}`}
          className="mt-4"
        />
      )}

      <div className="mt-6 space-y-4">
        {tiers.map((tier) => {
          const remaining = getTicketsRemaining(tier);
          const soldOut = remaining === 0;
          const qty = quantities[tier.id] ?? 0;

          return (
            <div
              key={tier.id}
              className={`rounded-xl border p-4 transition-colors ${
                soldOut
                  ? "border-border/50 opacity-60"
                  : qty > 0
                    ? "border-accent/50 bg-accent/5"
                    : "border-border hover:border-border/80"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{tier.name}</h3>
                    {soldOut && (
                      <span className="text-xs font-medium text-red-400">
                        Sold out
                      </span>
                    )}
                    {!soldOut && remaining < 50 && (
                      <span className="text-xs font-medium text-amber-400">
                        {remaining} left
                      </span>
                    )}
                    {tier.price === 0 && !soldOut && (
                      <span className="text-xs font-medium text-emerald-400">
                        Free
                      </span>
                    )}
                  </div>
                  {tier.description && (
                    <p className="mt-1 text-sm text-muted">{tier.description}</p>
                  )}
                  <p className="mt-2 text-lg font-semibold">
                    {tier.price === 0 ? "Free" : formatPrice(tier.price)}
                  </p>
                </div>

                {!soldOut && !purchaseDisabled && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQty(tier.id, -1, remaining)}
                      disabled={qty === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-foreground disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-medium">{qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(tier.id, 1, remaining)}
                      disabled={qty >= Math.min(8, remaining)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-foreground disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allSoldOut && (
        <p className="mt-6 text-sm text-muted">
          All tiers are sold out for {eventTitle}.
        </p>
      )}

      {totalTickets > 0 && !purchaseDisabled && (
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
            </span>
            <span className="text-lg font-semibold">
              {totalPrice === 0 ? "Free" : formatPrice(totalPrice)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            {totalPrice === 0
              ? "Free RSVP — no payment required"
              : "Pay at the door — online payment coming soon"}
          </p>
          <Button href={checkoutUrl} className="mt-4 w-full" size="lg">
            Continue to checkout
          </Button>
        </div>
      )}
    </div>
  );
}
