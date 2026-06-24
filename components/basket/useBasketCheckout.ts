"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useBasket } from "@/components/basket/BasketProvider";
import {
  BASKET_EXPIRED_MESSAGE,
  getCheckoutUrlIfValid,
} from "@/lib/basket/checkout-nav";

export function useBasketCheckout(eventSlug: string) {
  const router = useRouter();
  const { basket, clear, secondsRemaining } = useBasket();

  const goToCheckout = useCallback(
    (quantities: Record<string, number>, onBeforeNavigate?: () => void) => {
      if (!secondsRemaining || secondsRemaining <= 0) {
        clear();
        window.alert(BASKET_EXPIRED_MESSAGE);
        return false;
      }

      const url = getCheckoutUrlIfValid(basket, eventSlug, quantities);
      if (!url) {
        clear();
        window.alert(BASKET_EXPIRED_MESSAGE);
        return false;
      }

      onBeforeNavigate?.();
      router.push(url);
      return true;
    },
    [basket, clear, eventSlug, router, secondsRemaining],
  );

  return { goToCheckout };
}
