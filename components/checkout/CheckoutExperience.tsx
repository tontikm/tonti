"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import type { CheckoutCart } from "@/lib/checkout";
import type { FanUser } from "@/lib/auth/session";
import type { Event } from "@/lib/types";
import type { PromoPreview } from "@/lib/promo/codes";
import { CheckoutAuthGate } from "@/components/auth/CheckoutAuthGate";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { CheckoutSummaryCompact } from "@/components/checkout/CheckoutSummaryCompact";

type CheckoutExperienceProps = {
  event: Event;
  cart: CheckoutCart;
  user: FanUser | null;
  organizerEmail: string | null;
  authConfigured: boolean;
  payfastEnabled: boolean;
  paymentCancelled?: boolean;
  returnTo: string;
};

export function CheckoutExperience({
  event,
  cart,
  user,
  organizerEmail,
  authConfigured,
  payfastEnabled,
  paymentCancelled = false,
  returnTo,
}: CheckoutExperienceProps) {
  const [promo, setPromo] = useState<PromoPreview | null>(null);
  const [showCancelledNotice, setShowCancelledNotice] = useState(paymentCancelled);
  const selectionsJson = JSON.stringify(
    Object.fromEntries(cart.lines.map((line) => [line.tierId, line.quantity])),
  );

  const displayTotal = promo?.totalAmount ?? cart.checkoutTotal;
  const isFree = displayTotal === 0;
  const payfastActive = payfastEnabled && !isFree;

  return (
    <>
      <Link
        href={`/events/${event.slug}`}
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to event
      </Link>

      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Checkout</h1>

      {showCancelledNotice && (
        <div
          role="status"
          className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
        >
          <p>Payment was cancelled. Your tickets were not charged. Try again when ready.</p>
          <button
            type="button"
            onClick={() => setShowCancelledNotice(false)}
            className="shrink-0 rounded-lg p-1 text-amber-200/80 transition-colors hover:bg-amber-500/20 hover:text-amber-50"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <CheckoutSteps current={user ? 2 : 1} />

      <p className="mt-2 text-sm text-muted">
        {user
          ? payfastActive
            ? "Review your order, then continue to Payfast for secure payment."
            : "Review your order and confirm your tickets."
          : organizerEmail
            ? "You're signed in as an organizer. Use a fan account below to complete this order."
            : "Sign in or create an account to complete your order."}
      </p>

      <div className="mt-10 flex flex-col gap-10 lg:grid lg:grid-cols-[1fr_380px]">
        {!user && (
          <div className="order-1 lg:hidden">
            <CheckoutSummaryCompact event={event} cart={cart} promo={promo} />
          </div>
        )}

        <div className="order-2 lg:order-1">
          {user ? (
            <CheckoutForm
              eventSlug={event.slug}
              cart={cart}
              user={user}
              payfastEnabled={payfastActive}
              selectionsJson={selectionsJson}
              promo={promo}
              onPromoChange={setPromo}
              displayTotal={displayTotal}
            />
          ) : (
            <CheckoutAuthGate
              returnTo={returnTo}
              authConfigured={authConfigured}
              organizerEmail={organizerEmail}
            />
          )}
        </div>

        <div
          className={`order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start ${!user ? "hidden lg:block" : ""}`}
        >
          <CheckoutSummary
            event={event}
            cart={cart}
            promo={promo}
            payfastEnabled={payfastActive}
          />
        </div>
      </div>
    </>
  );
}

const STEPS = ["Cart", "Sign in", "Pay"];

function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="mt-5 flex items-center gap-2">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                done
                  ? "border-brand bg-brand text-brand-foreground"
                  : active
                    ? "border-brand text-brand"
                    : "border-border text-muted"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : step}
            </span>
            <span
              className={`text-xs font-medium ${active || done ? "text-foreground" : "text-muted"}`}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span
                className={`mx-1 h-px flex-1 ${done ? "bg-brand" : "bg-border"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
