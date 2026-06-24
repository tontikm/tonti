"use client";

import { useState } from "react";
import { ShoppingBasket } from "lucide-react";
import { useBasket } from "@/components/basket/BasketProvider";
import { BasketDrawer } from "@/components/basket/BasketDrawer";
import { cn } from "@/lib/utils";

export function BasketButton() {
  const { ticketCount } = useBasket();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-white/10",
        )}
        aria-label={
          ticketCount > 0
            ? `Open basket, ${ticketCount} tickets`
            : "Open basket"
        }
      >
        <ShoppingBasket className="h-5 w-5" />
        {ticketCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-black">
            {ticketCount > 9 ? "9+" : ticketCount}
          </span>
        ) : null}
      </button>
      <BasketDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
