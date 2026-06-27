"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type TicketIssuingPollerProps = {
  orderId: string;
};

export function TicketIssuingPoller({ orderId }: TicketIssuingPollerProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [router, orderId]);

  return null;
}
