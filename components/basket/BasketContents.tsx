"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import type { CheckoutCart } from "@/lib/checkout";
import { buildCheckoutUrl } from "@/lib/checkout";
import type { BasketSnapshot } from "@/lib/basket/storage";
import { getSafeEventImageUrl } from "@/lib/images";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

type BasketContentsProps = {
  basket: BasketSnapshot;
  cart: CheckoutCart;
  compact?: boolean;
  editable?: boolean;
  warning?: string | null;
  onQuantityChange?: (tierId: string, quantity: number) => void;
  onCheckout?: () => void;
  onViewBasket?: () => void;
  onClear?: () => void;
};

export function BasketContents({
  basket,
  cart,
  compact = false,
  editable = false,
  warning,
  onQuantityChange,
  onCheckout,
  onViewBasket,
  onClear,
}: BasketContentsProps) {
  const totalLabel = cart.isFree ? "Free" : formatPrice(cart.totalAmount);
  const checkoutUrl = buildCheckoutUrl(basket.eventSlug, basket.quantities);

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="flex gap-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10">
          <Image
            src={getSafeEventImageUrl(basket.eventImage)}
            alt=""
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="min-w-0">
          <Link
            href={`/events/${basket.eventSlug}`}
            className="line-clamp-2 font-medium leading-snug hover:underline"
            onClick={onViewBasket}
          >
            {basket.eventTitle}
          </Link>
          <p className="mt-1 text-sm text-muted">
            {cart.totalTickets} ticket{cart.totalTickets !== 1 ? "s" : ""} ·{" "}
            {totalLabel}
          </p>
        </div>
      </div>

      {warning ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-100">
          {warning}
        </p>
      ) : null}

      <ul className="space-y-3">
        {cart.lines.map((line) => (
          <li
            key={line.tierId}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium">{line.tierName}</p>
              <p className="text-muted">
                {line.price === 0 ? "Free" : formatPrice(line.price)} each
              </p>
            </div>
            {editable && onQuantityChange ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onQuantityChange(line.tierId, line.quantity - 1)
                  }
                  disabled={line.quantity <= 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-muted hover:text-foreground disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center font-medium">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onQuantityChange(line.tierId, line.quantity + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-muted hover:text-foreground"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <span className="shrink-0 text-muted">×{line.quantity}</span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <span className="font-medium">Total</span>
        <span className="text-lg font-bold text-emerald-400">{totalLabel}</span>
      </div>

      <div className={compact ? "flex flex-col gap-2" : "flex flex-col gap-3"}>
        <div
          className={
            compact ? "flex flex-col gap-2" : "flex flex-col gap-3 sm:flex-row"
          }
        >
          {!compact ? (
            <Button
              href="/basket"
              variant="secondary"
              className="w-full sm:flex-1"
              onClick={onViewBasket}
            >
              View basket
            </Button>
          ) : (
            <Button
              href="/basket"
              variant="secondary"
              className="w-full"
              onClick={onViewBasket}
            >
              View basket
            </Button>
          )}
          <Button
            href={checkoutUrl}
            className="w-full sm:flex-1"
            onClick={onCheckout}
          >
            Checkout
          </Button>
        </div>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-center text-sm text-muted transition-colors hover:text-red-300"
          >
            Empty basket
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function BasketEmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "py-6 text-center" : "py-12 text-center"}>
      <p className="text-sm text-muted">Your basket is empty.</p>
      <Button href="/events" variant="secondary" className="mt-4" size="sm">
        Browse events
      </Button>
    </div>
  );
}
