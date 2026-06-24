"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BASKET_CHANGED_EVENT,
  clearBasket as clearStoredBasket,
  getBasketSecondsRemaining,
  getBasketTicketCount,
  readBasket,
  writeBasket,
  type BasketEventMeta,
  type BasketSnapshot,
} from "@/lib/basket/storage";

type BasketContextValue = {
  basket: BasketSnapshot | null;
  ticketCount: number;
  secondsRemaining: number | null;
  isReady: boolean;
  setItems: (event: BasketEventMeta, quantities: Record<string, number>) => void;
  replaceEvent: (event: BasketEventMeta, quantities: Record<string, number>) => void;
  updateQuantities: (quantities: Record<string, number>) => void;
  clear: () => void;
  isForEvent: (eventSlug: string) => boolean;
};

const BasketContext = createContext<BasketContextValue | null>(null);

function computeSecondsRemaining(basket: BasketSnapshot | null): number | null {
  if (!basket) return null;
  return getBasketSecondsRemaining(basket);
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [basket, setBasket] = useState<BasketSnapshot | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    const next = readBasket();
    setBasket(next);
    setSecondsRemaining(computeSecondsRemaining(next));
  }, []);

  const clear = useCallback(() => {
    clearStoredBasket();
    setBasket(null);
    setSecondsRemaining(null);
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);

    function onStorage(event: StorageEvent) {
      if (event.key === null || event.key === "spotra:basket") {
        refresh();
      }
    }

    function onBasketChanged() {
      refresh();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(BASKET_CHANGED_EVENT, onBasketChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(BASKET_CHANGED_EVENT, onBasketChanged);
    };
  }, [refresh]);

  useEffect(() => {
    if (!basket) return;

    const tick = () => {
      const current = readBasket();
      if (!current) {
        clear();
        return;
      }
      const remaining = getBasketSecondsRemaining(current);
      if (remaining <= 0) {
        clear();
        return;
      }
      setSecondsRemaining(remaining);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [basket, clear]);

  const setItems = useCallback(
    (event: BasketEventMeta, quantities: Record<string, number>) => {
      writeBasket({
        eventSlug: event.slug,
        eventTitle: event.title,
        eventImage: event.image,
        quantities,
      });
      refresh();
    },
    [refresh],
  );

  const replaceEvent = useCallback(
    (event: BasketEventMeta, quantities: Record<string, number>) => {
      setItems(event, quantities);
    },
    [setItems],
  );

  const updateQuantities = useCallback(
    (quantities: Record<string, number>) => {
      const current = readBasket();
      if (!current) return;
      writeBasket({ ...current, quantities });
      refresh();
    },
    [refresh],
  );

  const isForEvent = useCallback(
    (eventSlug: string) => hydrated && basket?.eventSlug === eventSlug,
    [basket?.eventSlug, hydrated],
  );

  const value = useMemo(
    () => ({
      basket: hydrated ? basket : null,
      ticketCount: getBasketTicketCount(hydrated ? basket : null),
      secondsRemaining: hydrated ? secondsRemaining : null,
      isReady: hydrated,
      setItems,
      replaceEvent,
      updateQuantities,
      clear,
      isForEvent,
    }),
    [
      basket,
      clear,
      hydrated,
      isForEvent,
      replaceEvent,
      secondsRemaining,
      setItems,
      updateQuantities,
    ],
  );

  return (
    <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
  );
}

export function useBasket(): BasketContextValue {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within BasketProvider");
  }
  return context;
}
