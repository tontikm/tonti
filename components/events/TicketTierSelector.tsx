"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus, Ticket } from "lucide-react";
import type { TicketTier } from "@/lib/types";
import {
  buildCheckoutUrl,
  MAX_CHECKOUT_TICKETS,
  MAX_CHECKOUT_TICKETS_PER_TIER,
} from "@/lib/checkout";
import { OrganizerFanAuthNotice } from "@/components/auth/OrganizerFanAuthNotice";
import { Button } from "@/components/ui/Button";
import { StickyPurchaseBar } from "@/components/tickets/StickyPurchaseBar";
import {
  availabilityLabel,
  formatPrice,
  getTierAvailability,
  getTicketsRemaining,
} from "@/lib/utils";

type TicketTierSelectorProps = {
  eventSlug: string;
  eventTitle: string;
  tiers: TicketTier[];
  organizerEmail?: string | null;
};

function availabilityClassName(
  status: ReturnType<typeof getTierAvailability>,
): string {
  switch (status) {
    case "sold-out":
      return "text-red-400";
    case "limited":
      return "text-brand";
    case "available":
      return "text-emerald-400";
  }
}

export function TicketTierSelector({
  eventSlug,
  eventTitle,
  tiers,
  organizerEmail,
}: TicketTierSelectorProps) {
  const reduceMotion = useReducedMotion();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQty = (tierId: string, delta: number, tierRemaining: number) => {
    setQuantities((prev) => {
      const current = prev[tierId] ?? 0;
      const otherTotal = Object.entries(prev).reduce(
        (sum, [id, qty]) => (id === tierId ? sum : sum + qty),
        0,
      );
      const maxQty = Math.min(
        MAX_CHECKOUT_TICKETS_PER_TIER,
        tierRemaining,
        Math.max(0, MAX_CHECKOUT_TICKETS - otherTotal),
      );
      const next = Math.max(0, Math.min(maxQty, current + delta));
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
  const allSoldOut = tiers.every(
    (tier) => getTierAvailability(tier) === "sold-out",
  );
  const purchaseDisabled = Boolean(organizerEmail);
  const showPurchaseBar = totalTickets > 0 && !purchaseDisabled;
  const totalLabel = totalPrice === 0 ? "Free" : formatPrice(totalPrice);
  const purchaseSubtitle =
    totalPrice === 0
      ? "Free RSVP. No payment required"
      : "Pay at the door. Online payment coming soon";

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-4 lg:p-6">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-accent lg:h-5 lg:w-5" />
          <h2 className="text-base font-semibold lg:text-lg">Get tickets</h2>
        </div>

        {organizerEmail && (
          <OrganizerFanAuthNotice
            organizerEmail={organizerEmail}
            fanLoginHref={`/login?next=${encodeURIComponent(buildCheckoutUrl(eventSlug, {}))}`}
            className="mt-3 lg:mt-4"
          />
        )}

        <div className="mt-4 space-y-3 lg:mt-6 lg:space-y-4">
          {tiers.map((tier) => {
            const remaining = getTicketsRemaining(tier);
            const availability = getTierAvailability(tier);
            const soldOut = availability === "sold-out";
            const qty = quantities[tier.id] ?? 0;
            const otherTierTickets = totalTickets - qty;
            const maxQty = Math.min(
              MAX_CHECKOUT_TICKETS_PER_TIER,
              remaining,
              Math.max(0, MAX_CHECKOUT_TICKETS - otherTierTickets),
            );

            return (
              <div
                key={tier.id}
                className={`rounded-xl border p-3 transition-colors lg:p-4 ${
                  soldOut
                    ? "border-border/50 opacity-60"
                    : qty > 0
                      ? "border-brand/50 bg-brand-soft"
                      : "border-border hover:border-border/80"
                }`}
              >
                <div className="flex items-start justify-between gap-3 lg:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                      <h3 className="text-sm font-medium lg:text-base">{tier.name}</h3>
                      <span
                        className={`text-xs font-medium ${availabilityClassName(availability)}`}
                      >
                        {availabilityLabel(availability)}
                      </span>
                      {tier.price === 0 && !soldOut && (
                        <span className="text-xs font-medium text-emerald-400">
                          Free
                        </span>
                      )}
                    </div>
                    {tier.description && (
                      <p className="mt-0.5 text-xs text-muted lg:mt-1 lg:text-sm">
                        {tier.description}
                      </p>
                    )}
                    <p className="mt-1.5 text-base font-semibold lg:mt-2 lg:text-lg">
                      {tier.price === 0 ? "Free" : formatPrice(tier.price)}
                    </p>
                  </div>

                  {!soldOut && !purchaseDisabled && (
                    <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">
                      <motion.button
                        type="button"
                        whileTap={reduceMotion ? undefined : { scale: 0.85 }}
                        onClick={() => updateQty(tier.id, -1, remaining)}
                        disabled={qty === 0}
                        className="focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-brand hover:text-foreground disabled:opacity-30 lg:h-8 lg:w-8"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </motion.button>
                      <div className="relative h-5 w-5 overflow-hidden text-center lg:h-6 lg:w-6">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={qty}
                            initial={reduceMotion ? false : { y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={reduceMotion ? undefined : { y: -12, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="absolute inset-0 text-sm font-medium lg:text-base"
                          >
                            {qty}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <motion.button
                        type="button"
                        whileTap={reduceMotion ? undefined : { scale: 0.85 }}
                        onClick={() => updateQty(tier.id, 1, remaining)}
                        disabled={qty >= maxQty}
                        className="focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-brand hover:text-foreground disabled:opacity-30 lg:h-8 lg:w-8"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalTickets >= MAX_CHECKOUT_TICKETS && !purchaseDisabled && (
          <p className="mt-3 text-xs text-muted lg:mt-4 lg:text-sm">
            Maximum {MAX_CHECKOUT_TICKETS} tickets per order.
          </p>
        )}

        {allSoldOut && (
          <p className="mt-4 text-xs text-muted lg:mt-6 lg:text-sm">
            All tiers are sold out for {eventTitle}.
          </p>
        )}
      </div>

      <StickyPurchaseBar
        visible={showPurchaseBar}
        ticketCount={totalTickets}
        totalLabel={totalLabel}
        subtitle={purchaseSubtitle}
        action={
          <Button
            href={checkoutUrl}
            size="lg"
            className="whitespace-nowrap px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base"
          >
            Continue to checkout
          </Button>
        }
      />
    </>
  );
}
