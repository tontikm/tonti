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
  getBasketTicketCount,
  readBasket,
  writeBasket,
  type BasketEventMeta,
  type BasketSnapshot,
} from "@/lib/basket/storage";

type BasketContextValue = {
  basket: BasketSnapshot | null;
  ticketCount: number;
  setItems: (event: BasketEventMeta, quantities: Record<string, number>) => void;
  replaceEvent: (event: BasketEventMeta, quantities: Record<string, number>) => void;
  updateQuantities: (quantities: Record<string, number>) => void;
  clear: () => void;
  isForEvent: (eventSlug: string) => boolean;
};

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [basket, setBasket] = useState<BasketSnapshot | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setBasket(readBasket());
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

  const setItems = useCallback(
    (event: BasketEventMeta, quantities: Record<string, number>) => {
      const snapshot: BasketSnapshot = {
        eventSlug: event.slug,
        eventTitle: event.title,
        eventImage: event.image,
        quantities,
        updatedAt: new Date().toISOString(),
      };
      writeBasket(snapshot);
      setBasket(readBasket());
    },
    [],
  );

  const replaceEvent = useCallback(
    (event: BasketEventMeta, quantities: Record<string, number>) => {
      setItems(event, quantities);
    },
    [setItems],
  );

  const updateQuantities = useCallback((quantities: Record<string, number>) => {
    const current = readBasket();
    if (!current) return;
    writeBasket({ ...current, quantities });
    setBasket(readBasket());
  }, []);

  const clear = useCallback(() => {
    clearStoredBasket();
    setBasket(null);
  }, []);

  const isForEvent = useCallback(
    (eventSlug: string) => hydrated && basket?.eventSlug === eventSlug,
    [basket?.eventSlug, hydrated],
  );

  const value = useMemo(
    () => ({
      basket: hydrated ? basket : null,
      ticketCount: getBasketTicketCount(hydrated ? basket : null),
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
