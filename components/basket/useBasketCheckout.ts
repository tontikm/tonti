"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useBasket } from "@/components/basket/BasketProvider";
import {
  BASKET_EXPIRED_MESSAGE,
  getCheckoutUrlIfValid,
} from "@/lib/basket/checkout-nav";
import { getBasketSecondsRemaining } from "@/lib/basket/timer";

export function useBasketCheckout(eventSlug: string) {
  const router = useRouter();
  const { basket, clear } = useBasket();

  const goToCheckout = useCallback(
    (quantities: Record<string, number>, onBeforeNavigate?: () => void) => {
      const remaining = basket ? getBasketSecondsRemaining(basket) : 0;
      if (!basket || remaining <= 0) {
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
    [basket, clear, eventSlug, router],
  );

  return { goToCheckout };
}
