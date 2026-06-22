"use client";

import { useActionState } from "react";
import { recordOrganizerPayout } from "@/app/admin/actions";
import type { AdminActionState } from "@/app/admin/actions";

type RecordPayoutFormProps = {
  organizerId: string;
  outstanding: number;
};

const initialState: AdminActionState = {};

export function RecordPayoutForm({
  organizerId,
  outstanding,
}: RecordPayoutFormProps) {
  const [state, formAction, pending] = useActionState(
    recordOrganizerPayout,
    initialState,
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-white/10 bg-surface/40 p-5"
    >
      <input type="hidden" name="organizerId" value={organizerId} />
      <h3 className="text-sm font-semibold">Record payout</h3>
      <p className="mt-1 text-xs text-muted">
        Outstanding balance: R{outstanding.toFixed(2)}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">Amount (ZAR)</span>
          <input
            type="number"
            name="amount"
            min="0.01"
            step="0.01"
            required
            defaultValue={outstanding > 0 ? outstanding.toFixed(2) : ""}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Payment date</span>
          <input
            type="date"
            name="paidAt"
            defaultValue={today}
            required
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted">EFT reference</span>
          <input
            type="text"
            name="reference"
            placeholder="Bank reference"
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted">Notes</span>
          <textarea
            name="notes"
            rows={2}
            placeholder="Optional notes"
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2"
          />
        </label>
      </div>

      {state.error && (
        <p className="mt-3 text-sm text-red-300">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-3 text-sm text-emerald-300">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-500 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Record payout"}
      </button>
    </form>
  );
}
