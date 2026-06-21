"use client";

import { useActionState } from "react";
import { Percent, Tag } from "lucide-react";
import {
  createPromoCode,
  togglePromoCodeActive,
  type ActionState,
} from "@/app/organizer/actions";
import type { PromoCode } from "@/lib/promo/codes";
import { Button } from "@/components/ui/Button";
import { formatEventDate } from "@/lib/utils";

type PromoCodeManagerProps = {
  eventSlug: string;
  promos: PromoCode[];
};

const initialState: ActionState = {};

export function PromoCodeManager({ eventSlug, promos }: PromoCodeManagerProps) {
  const [state, formAction, pending] = useActionState(
    createPromoCode,
    initialState,
  );

  return (
    <div className="space-y-10">
      <form
        action={formAction}
        className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Create promo code</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          Fans enter codes at checkout. Discount applies to ticket subtotal before
          the 3% platform fee.
        </p>

        <input type="hidden" name="eventSlug" value={eventSlug} />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Code</span>
            <input
              name="code"
              required
              maxLength={32}
              placeholder="SUMMER20"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 font-mono text-sm uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal focus:border-foreground/40 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Discount type</span>
            <select
              name="discountType"
              defaultValue="percent"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
            >
              <option value="percent">Percentage off</option>
              <option value="fixed">Fixed amount (R)</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Value</span>
            <input
              name="discountValue"
              type="number"
              min={1}
              step="any"
              required
              placeholder="20"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Max uses (optional)</span>
            <input
              name="maxUses"
              type="number"
              min={1}
              placeholder="Unlimited"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Expires (optional)</span>
            <input
              name="expiresAt"
              type="datetime-local"
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
          <Button type="submit" size="md" disabled={pending}>
            {pending ? "Creating…" : "Create code"}
          </Button>
        </div>
      </form>

      <div>
        <h2 className="text-lg font-semibold">Active codes</h2>
        {promos.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No promo codes yet. Create one above for influencers, early birds, or
            staff comps.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {promos.map((promo) => (
              <li
                key={promo.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold">{promo.code}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        promo.active
                          ? "border border-emerald-500/30 text-emerald-400"
                          : "border border-border text-muted"
                      }`}
                    >
                      {promo.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    <Percent className="mr-1 inline h-3.5 w-3.5" />
                    {promo.discountType === "percent"
                      ? `${promo.discountValue}% off`
                      : `R${promo.discountValue} off`}
                    {" · "}
                    {promo.usesCount}
                    {promo.maxUses != null ? ` / ${promo.maxUses}` : ""} uses
                    {promo.expiresAt
                      ? ` · Expires ${formatEventDate(promo.expiresAt)}`
                      : ""}
                  </p>
                </div>
                <form action={togglePromoCodeActive}>
                  <input type="hidden" name="eventSlug" value={eventSlug} />
                  <input type="hidden" name="promoId" value={promo.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={promo.active ? "false" : "true"}
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    {promo.active ? "Deactivate" : "Activate"}
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
