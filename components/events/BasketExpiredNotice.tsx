"use client";

import { useSearchParams } from "next/navigation";

export function BasketExpiredNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("basket") !== "expired") return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
      Your basket expired. Select tickets again.
    </div>
  );
}
