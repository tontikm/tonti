"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestFanPasswordReset,
  type AuthState,
} from "@/app/auth/actions";
import { FanAuthCard } from "@/components/auth/FanAuthCard";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

type ForgotPasswordFormProps = {
  authConfigured: boolean;
  returnTo?: string;
};

export function ForgotPasswordForm({
  authConfigured,
  returnTo = "/login",
}: ForgotPasswordFormProps) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestFanPasswordReset,
    {},
  );

  return (
    <FanAuthCard
      title="Forgot your password?"
      description="Enter your fan account email and we will send a reset link."
      footer={
        <p className="text-center text-sm text-muted">
          <Link href={returnTo} className="hover:text-foreground">
            ← Back to sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        {!authConfigured && (
          <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
            Fan sign-in is not configured on this environment.
          </div>
        )}

        {state.error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {state.error}
          </div>
        ) : null}

        {state.message ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {state.message}
          </div>
        ) : null}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-semibold"
            size="lg"
            disabled={!authConfigured || pending}
          >
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </div>
    </FanAuthCard>
  );
}
