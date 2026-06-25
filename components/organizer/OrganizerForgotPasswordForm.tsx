"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestOrganizerPasswordResetAction,
  type LoginState,
} from "@/app/organizer/actions";
import { OrganizerAuthCard } from "@/components/organizer/OrganizerAuthCard";
import { OrganizerPublicShell } from "@/components/organizer/OrganizerPublicShell";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-white/40 focus:outline-none";

export function OrganizerForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    requestOrganizerPasswordResetAction,
    {},
  );

  return (
    <OrganizerPublicShell>
      <OrganizerAuthCard
        backLink={
          <Link
            href="/organizer/login"
            className="mb-6 inline-block text-sm text-muted hover:text-foreground"
          >
            ← Back to sign in
          </Link>
        }
        title="Forgot your password?"
        description="Enter your organizer email and we will send a reset link."
      >
        <div className="space-y-4">
          {state.error ? (
            <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
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
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="promoter@venue.co.za"
                className={inputClass}
              />
            </div>
            <Button
              type="submit"
              className="organizer-accent-btn w-full"
              size="lg"
              disabled={pending}
            >
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        </div>
      </OrganizerAuthCard>
    </OrganizerPublicShell>
  );
}
