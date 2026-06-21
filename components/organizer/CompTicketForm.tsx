"use client";

import { useActionState } from "react";
import { Gift } from "lucide-react";
import type { TicketTier } from "@/lib/types";
import { issueCompTickets, type ActionState } from "@/app/organizer/actions";
import { Button } from "@/components/ui/Button";

type CompTicketFormProps = {
  eventSlug: string;
  tiers: TicketTier[];
};

const initialState: ActionState = {};

export function CompTicketForm({ eventSlug, tiers }: CompTicketFormProps) {
  const [state, formAction, pending] = useActionState(
    issueCompTickets,
    initialState,
  );

  const availableTiers = tiers.filter((tier) => tier.capacity > tier.sold);

  return (
    <form action={formAction} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold">Issue comp tickets</h2>
      </div>
      <p className="mt-2 text-sm text-muted">
        Add complimentary guest-list tickets. They count toward tier capacity and
        appear on the guest list with QR codes.
      </p>

      <input type="hidden" name="eventSlug" value={eventSlug} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Guest name</span>
          <input
            name="holderName"
            required
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
            placeholder="e.g. Thabo M."
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Guest email</span>
          <input
            name="holderEmail"
            type="email"
            required
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
            placeholder="guest@example.com"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Tier</span>
          <select
            name="tierId"
            required
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
            defaultValue={availableTiers[0]?.id ?? ""}
          >
            {availableTiers.length === 0 ? (
              <option value="">No tiers with capacity</option>
            ) : (
              availableTiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name}
                </option>
              ))
            )}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Quantity</span>
          <input
            name="qty"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            required
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
          />
        </label>
      </div>

      {state.error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-4 text-sm text-emerald-400" role="status">
          {state.success}
        </p>
      )}

      <div className="mt-5">
        <Button
          type="submit"
          size="md"
          disabled={pending || availableTiers.length === 0}
        >
          {pending ? "Issuing…" : "Issue comp tickets"}
        </Button>
      </div>
    </form>
  );
}
