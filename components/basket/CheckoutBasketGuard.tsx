"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BasketTimer } from "@/components/basket/BasketTimer";
import { useBasket } from "@/components/basket/BasketProvider";
import { readBasket, writeBasket } from "@/lib/basket/storage";
import { isBasketValidForEvent } from "@/lib/basket/timer";

type CheckoutBasketGuardProps = {
  eventSlug: string;
  eventTitle: string;
  eventImage?: string;
  quantities: Record<string, number>;
  children: ReactNode;
};

export function CheckoutBasketGuard({
  eventSlug,
  eventTitle,
  eventImage,
  quantities,
  children,
}: CheckoutBasketGuardProps) {
  const router = useRouter();
  const { basket, clear, secondsRemaining, isReady } = useBasket();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isReady || allowed) return;

    if (isBasketValidForEvent(basket, eventSlug)) {
      writeBasket({
        eventSlug: basket!.eventSlug,
        eventTitle: basket!.eventTitle,
        eventImage: basket!.eventImage,
        quantities: basket!.quantities,
      });
      setAllowed(true);
      return;
    }

    const hasQuantities = Object.values(quantities).some((qty) => qty > 0);
    if (hasQuantities) {
      writeBasket({
        eventSlug,
        eventTitle,
        eventImage,
        quantities,
      });
      if (isBasketValidForEvent(readBasket(), eventSlug)) {
        setAllowed(true);
        return;
      }
    }

    clear();
    router.replace(`/events/${eventSlug}?basket=expired`);
  }, [
    allowed,
    basket,
    clear,
    eventImage,
    eventSlug,
    eventTitle,
    isReady,
    quantities,
    router,
  ]);

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
