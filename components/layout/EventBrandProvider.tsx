"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type EventBrand = {
  name: string;
  logo: string;
  href: string;
};

type EventBrandContextValue = {
  brand: EventBrand | null;
  setBrand: (brand: EventBrand | null) => void;
};

const EventBrandContext = createContext<EventBrandContextValue | null>(null);

export function EventBrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandState] = useState<EventBrand | null>(null);
  const setBrand = useCallback((next: EventBrand | null) => {
    setBrandState(next);
  }, []);

  const value = useMemo(
    () => ({ brand, setBrand }),
    [brand, setBrand],
  );

  return (
    <EventBrandContext.Provider value={value}>
      {children}
    </EventBrandContext.Provider>
  );
}

export function useEventBrand(): EventBrandContextValue {
  const context = useContext(EventBrandContext);
  if (!context) {
    throw new Error("useEventBrand must be used within EventBrandProvider");
  }
  return context;
}
