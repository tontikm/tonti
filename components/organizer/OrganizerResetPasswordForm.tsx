"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  resetOrganizerPasswordAction,
  type ActionState,
} from "@/app/organizer/actions";
import { OrganizerAuthCard } from "@/components/organizer/OrganizerAuthCard";
import { OrganizerPublicShell } from "@/components/organizer/OrganizerPublicShell";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-white/40 focus:outline-none";

type OrganizerResetPasswordFormProps = {
  token: string;
};

export function OrganizerResetPasswordForm({
  token,
}: OrganizerResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resetOrganizerPasswordAction,
    {},
  );

  return (
    <OrganizerPublicShell>
      <OrganizerAuthCard
        backLink={
          <Link
            href="/organizer/forgot-password"
            className="mb-6 inline-block text-sm text-muted hover:text-foreground"
          >
            ← Request a new link
          </Link>
        }
        title="Choose a new password"
        description="Set a new password for your organizer account."
      >
        <div className="space-y-4">
          {state.error ? (
            <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
              {state.error}
            </div>
          ) : null}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className={inputClass}
              />
            </div>
            <Button
              type="submit"
              className="organizer-accent-btn w-full"
              size="lg"
              disabled={pending}
            >
              {pending ? "Saving…" : "Update password"}
            </Button>
          </form>
        </div>
      </OrganizerAuthCard>
    </OrganizerPublicShell>
  );
}
