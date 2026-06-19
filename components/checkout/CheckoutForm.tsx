"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import type { CheckoutCart } from "@/lib/checkout";
import { cartToSelections } from "@/lib/checkout";
import { claimTickets, type ClaimState } from "@/app/events/actions";
import type { FanUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/Button";

type CheckoutFormProps = {
  eventSlug: string;
  cart: CheckoutCart;
  user: FanUser;
  payfastEnabled: boolean;
};

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-white/40 focus:outline-none";

export function CheckoutForm({
  eventSlug,
  cart,
  user,
  payfastEnabled,
}: CheckoutFormProps) {
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [state, formAction, pending] = useActionState<ClaimState, FormData>(
    claimTickets,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <input
        type="hidden"
        name="selections"
        value={JSON.stringify(cartToSelections(cart))}
      />

      {state.error && (
        <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-foreground">
          {state.error}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold">Your details</h2>
        <p className="mt-1 text-sm text-muted">
          Signed in as {user.email}. QR tickets are issued to this name and
          email after you confirm.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="buyerName" className="mb-1.5 block text-sm font-medium">
              Full name *
            </label>
            <input
              id="buyerName"
              name="buyerName"
              required
              autoComplete="name"
              defaultValue={user.name}
              className={inputClass}
              placeholder="Thabo M."
            />
          </div>

          <div>
            <label htmlFor="buyerEmail" className="mb-1.5 block text-sm font-medium">
              Email *
            </label>
            <input
              id="buyerEmail"
              name="buyerEmail"
              type="email"
              required
              readOnly
              autoComplete="email"
              defaultValue={user.email}
              className={`${inputClass} cursor-not-allowed opacity-80`}
            />
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <input
              type="checkbox"
              name="whatsappOptIn"
              checked={whatsappOptIn}
              onChange={(event) => setWhatsappOptIn(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <span className="text-sm">
              <span className="font-medium">Send my tickets to WhatsApp</span>
              <span className="mt-1 block text-muted">
                We&apos;ll save your number so you can send your QR tickets in
                one tap after checkout.
              </span>
            </span>
          </label>

          <div>
            <label htmlFor="buyerPhone" className="mb-1.5 block text-sm font-medium">
              Mobile{" "}
              {whatsappOptIn ? (
                <span>*</span>
              ) : (
                <span className="text-muted">(optional)</span>
              )}
            </label>
            <input
              id="buyerPhone"
              name="buyerPhone"
              type="tel"
              autoComplete="tel"
              required={whatsappOptIn}
              className={inputClass}
              placeholder="+27 82 123 4567"
            />
            {whatsappOptIn ? (
              <p className="mt-1.5 text-xs text-muted">
                Required for WhatsApp delivery. Use a South African mobile
                number.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold">Payment</h2>
        {cart.isFree ? (
          <p className="mt-2 text-sm text-muted">
            This order is free. No payment step — confirm below to receive your
            QR tickets instantly.
          </p>
        ) : payfastEnabled ? (
          <p className="mt-2 text-sm text-muted">
            You&apos;ll be redirected to Payfast to pay securely. QR tickets are
            issued once payment is confirmed.
          </p>
        ) : (
          <div className="mt-2 space-y-2 text-sm text-muted">
            <p>
              Online payment is not enabled yet. Confirm below to receive QR
              tickets — pay the organizer at the door or as instructed.
            </p>
          </div>
        )}
      </section>

      <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm">
        <input
          type="checkbox"
          name="acceptTerms"
          required
          className="mt-0.5 h-4 w-4 rounded border-border"
        />
        <span className="text-muted">
          I agree to Tonti&apos;s{" "}
          <Link href="/legal/terms" className="text-foreground hover:underline">
            terms
          </Link>
          ,{" "}
          <Link href="/legal/privacy" className="text-foreground hover:underline">
            privacy policy
          </Link>
          , and{" "}
          <Link href="/legal/refunds" className="text-foreground hover:underline">
            refund policy
          </Link>
          .
        </span>
      </label>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending
          ? "Confirming…"
          : cart.isFree
            ? "Confirm free tickets"
            : payfastEnabled
              ? "Continue to Payfast"
              : "Confirm order — pay at door"}
      </Button>

      <p className="text-center text-xs text-muted">
        {cart.totalTickets} ticket{cart.totalTickets !== 1 ? "s" : ""} ·{" "}
        {cart.isFree
          ? "R0 due now"
          : payfastEnabled
            ? "Secure Payfast checkout"
            : "No charge online today"}
      </p>
    </form>
  );
}
