"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadBasketEvent } from "@/app/basket/actions";
import { useBasket } from "@/components/basket/BasketProvider";
import {
  BasketContents,
  BasketEmptyState,
} from "@/components/basket/BasketContents";
import {
  clampBasketToTiers,
} from "@/lib/basket/storage";
import type { CheckoutCart } from "@/lib/checkout";
import {
  MAX_CHECKOUT_TICKETS,
  MAX_CHECKOUT_TICKETS_PER_TIER,
} from "@/lib/checkout";
import type { TicketTier } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { getTicketsRemaining } from "@/lib/utils";

export default function BasketPage() {
  const { basket, clear, updateQuantities, replaceEvent } = useBasket();
  const [cart, setCart] = useState<CheckoutCart | null>(null);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(basket));

  useEffect(() => {
    if (!basket) {
      setCart(null);
      setTiers([]);
      setWarning(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    loadBasketEvent(basket.eventSlug).then((result) => {
      if (cancelled) return;
      setLoading(false);

      if ("error" in result) {
        setError(result.error);
        setCart(null);
        return;
      }

      const { basket: clamped, cart: built, changed } = clampBasketToTiers(
        basket,
        result.event.tiers,
      );

      if (changed) {
        replaceEvent(
          {
            slug: clamped.eventSlug,
            title: clamped.eventTitle,
            image: clamped.eventImage,
          },
          clamped.quantities,
        );
        setWarning("Some tickets were no longer available and were removed.");
      } else {
        setWarning(null);
      }

      if (!built) {
        setError("Your basket is empty or tickets are sold out.");
        setCart(null);
        setTiers(result.event.tiers);
        return;
      }

      setError(null);
      setCart(built);
      setTiers(result.event.tiers);
    });

    return () => {
      cancelled = true;
    };
  }, [basket, replaceEvent]);

  function handleClearBasket() {
    if (!window.confirm("Remove all tickets from your basket?")) return;
    clear();
  }

  function handleQuantityChange(tierId: string, quantity: number) {
    if (!basket) return;

    const tier = tiers.find((item) => item.id === tierId);
    if (!tier) return;

    const currentQty = basket.quantities[tierId] ?? 0;
    const otherTotal = Object.entries(basket.quantities).reduce(
      (sum, [id, qty]) => (id === tierId ? sum : sum + qty),
      0,
    );
    const remaining = getTicketsRemaining(tier);
    const maxQty = Math.min(
      MAX_CHECKOUT_TICKETS_PER_TIER,
      remaining,
      Math.max(0, MAX_CHECKOUT_TICKETS - otherTotal),
    );
    const nextQty = Math.max(0, Math.min(maxQty, quantity));

    const nextQuantities = { ...basket.quantities };
    if (nextQty === 0) {
      delete nextQuantities[tierId];
    } else {
      nextQuantities[tierId] = nextQty;
    }

    if (Object.keys(nextQuantities).length === 0) {
      clear();
      return;
    }

    updateQuantities(nextQuantities);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue browsing
      </Link>

      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Your basket</h1>
      <p className="mt-2 text-sm text-muted">
        Tickets for one event at a time. Checkout when you&apos;re ready.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        {loading ? (
          <p className="text-sm text-muted">Loading basket…</p>
        ) : !basket ? (
          <BasketEmptyState />
        ) : error ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-amber-200">{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="button" variant="secondary" onClick={clear}>
                Clear basket
              </Button>
              <Button href="/events">Browse events</Button>
            </div>
          </div>
        ) : cart ? (
          <BasketContents
            basket={basket}
            cart={cart}
            editable
            warning={warning}
            onQuantityChange={handleQuantityChange}
            onClear={handleClearBasket}
          />
        ) : (
          <BasketEmptyState />
        )}
      </div>
    </div>
  );
}
