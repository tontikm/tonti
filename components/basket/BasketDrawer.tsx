"use client";

import { useEffect, useState } from "react";
import { ShoppingBasket, X } from "lucide-react";
import { useBasket } from "@/components/basket/BasketProvider";
import {
  BasketContents,
  BasketEmptyState,
} from "@/components/basket/BasketContents";
import { loadBasketEvent } from "@/app/basket/actions";
import { buildCheckoutCartFromBasket } from "@/lib/basket/storage";

type BasketDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function BasketDrawer({ open, onClose }: BasketDrawerProps) {
  const { basket } = useBasket();
  const [warning, setWarning] = useState<string | null>(null);
  const [cart, setCart] = useState<ReturnType<typeof buildCheckoutCartFromBasket>>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !basket) {
      setCart(null);
      setWarning(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    loadBasketEvent(basket.eventSlug).then((result) => {
      if (cancelled) return;
      setLoading(false);

      if ("error" in result) {
        setWarning(result.error);
        setCart(null);
        return;
      }

      const built = buildCheckoutCartFromBasket(basket, result.event.tiers);
      if (!built) {
        setWarning("Some tickets in your basket are no longer available.");
        setCart(null);
        return;
      }

      const originalCount = Object.values(basket.quantities).reduce(
        (sum, qty) => sum + qty,
        0,
      );
      if (built.totalTickets < originalCount) {
        setWarning("Ticket availability changed — quantities were adjusted.");
      } else {
        setWarning(null);
      }
      setCart(built);
    });

    return () => {
      cancelled = true;
    };
  }, [open, basket]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75]">
      <button
        type="button"
        aria-label="Close basket"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <aside className="absolute right-0 top-0 flex h-full w-[min(100vw,24rem)] flex-col border-l border-white/10 bg-black shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="h-4 w-4 text-muted" />
            <span className="text-sm font-semibold">Basket</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-foreground"
            aria-label="Close basket"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {!basket ? (
            <BasketEmptyState compact />
          ) : loading ? (
            <p className="text-sm text-muted">Loading basket…</p>
          ) : cart ? (
            <BasketContents
              basket={basket}
              cart={cart}
              compact
              warning={warning}
              onCheckout={onClose}
              onViewBasket={onClose}
            />
          ) : (
            <div className="space-y-4">
              {warning ? (
                <p className="text-sm text-amber-200">{warning}</p>
              ) : null}
              <BasketEmptyState compact />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
