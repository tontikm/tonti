"use client";

import { useState, useTransition } from "react";
import { checkInTicket } from "@/app/events/actions";

type CheckInButtonProps = {
  code: string;
};

export function CheckInButton({ code }: CheckInButtonProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onCheckIn() {
    setMessage(null);
    startTransition(async () => {
      const result = await checkInTicket(code);
      setMessage(result.ok ? "Checked in successfully." : result.error ?? "Failed.");
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onCheckIn}
        disabled={pending}
        className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Checking in…" : "Mark checked in"}
      </button>
      {message && <p className="mt-3 text-sm text-muted">{message}</p>}
    </div>
  );
}
