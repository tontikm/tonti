"use client";

import { useActionState } from "react";
import { verifyOrganizerPayout } from "@/app/admin/actions";
import type { AdminActionState } from "@/app/admin/actions";
import type { PayoutVerificationMethod } from "@/lib/payments/payout-stages";

type VerifyOrganizerPayoutFormProps = {
  organizerId: string;
  verified: boolean;
  verificationMethod: PayoutVerificationMethod | null;
  verificationNotes: string | null;
  stageLabel: string;
  completedPaidEventCount: number;
};

const initialState: AdminActionState = {};

export function VerifyOrganizerPayoutForm({
  organizerId,
  verified,
  verificationMethod,
  verificationNotes,
  stageLabel,
  completedPaidEventCount,
}: VerifyOrganizerPayoutFormProps) {
  const [state, formAction, pending] = useActionState(
    verifyOrganizerPayout,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-white/10 bg-surface/40 p-5"
    >
      <input type="hidden" name="organizerId" value={organizerId} />
      <h3 className="text-sm font-semibold">Payout verification</h3>
      <p className="mt-1 text-xs text-muted">
        {stageLabel} · {completedPaidEventCount} completed paid event
        {completedPaidEventCount === 1 ? "" : "s"}
      </p>
      <p className="mt-2 text-xs text-muted">
        Stage 2 (50% early withdrawal) unlocks after verification and two
        completed paid events. Requires CIPC registration or ID plus bank
        confirmation letter.
      </p>

      <div className="mt-4 grid gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="verified"
            value="true"
            defaultChecked={verified}
            className="h-4 w-4 rounded border-white/20 accent-amber-500"
          />
          <span>Organizer verified for Stage 2 payouts</span>
        </label>

        <label className="block text-sm">
          <span className="text-muted">Verification method</span>
          <select
            name="verificationMethod"
            defaultValue={verificationMethod ?? ""}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2"
          >
            <option value="">—</option>
            <option value="cipc">CIPC registration</option>
            <option value="id_bank_letter">ID + bank confirmation letter</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-muted">Admin notes</span>
          <textarea
            name="verificationNotes"
            rows={2}
            defaultValue={verificationNotes ?? ""}
            placeholder="Document references, verification date, etc."
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
        className="mt-4 rounded-full border border-white/15 px-5 py-2 text-sm font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save verification"}
      </button>
    </form>
  );
}
