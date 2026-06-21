"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type PayfastCompletePollerProps = {
  orderId: string;
};

export function PayfastCompletePoller({ orderId }: PayfastCompletePollerProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [router, orderId]);

  return null;
}
