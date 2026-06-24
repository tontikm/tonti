"use client";

import { useEffect } from "react";
import { useBasket } from "@/components/basket/BasketProvider";

export function ClearBasketOnOrder() {
  const { clear } = useBasket();

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
