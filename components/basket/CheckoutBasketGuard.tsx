"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BasketTimer } from "@/components/basket/BasketTimer";
import { useBasket } from "@/components/basket/BasketProvider";
import { isBasketValidForEvent } from "@/lib/basket/timer";

type CheckoutBasketGuardProps = {
  eventSlug: string;
  children: ReactNode;
};

export function CheckoutBasketGuard({
  eventSlug,
  children,
}: CheckoutBasketGuardProps) {
  const router = useRouter();
  const { basket, clear, secondsRemaining, isReady } = useBasket();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    if (!isBasketValidForEvent(basket, eventSlug)) {
      clear();
      router.replace(`/events/${eventSlug}?basket=expired`);
      return;
    }
    setAllowed(true);
  }, [basket, clear, eventSlug, isReady, router]);

  useEffect(() => {
    if (!allowed || !isReady) return;
    if (secondsRemaining !== null && secondsRemaining <= 0) {
      clear();
      router.replace(`/events/${eventSlug}?basket=expired`);
    }
  }, [allowed, clear, eventSlug, isReady, router, secondsRemaining]);

  if (!isReady || !allowed) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-muted">
        Checking your basket…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BasketTimer variant="prominent" />
      {children}
    </div>
  );
}
