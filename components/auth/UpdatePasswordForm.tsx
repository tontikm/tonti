"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateFanPassword, type AuthState } from "@/app/auth/actions";
import { FanAuthCard } from "@/components/auth/FanAuthCard";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

type UpdatePasswordFormProps = {
  returnTo?: string;
};

export function UpdatePasswordForm({
  returnTo = "/account",
}: UpdatePasswordFormProps) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updateFanPassword,
    {},
  );

  return (
    <FanAuthCard
      title="Choose a new password"
      description="Enter a new password for your fan account."
      footer={
        <p className="text-center text-sm text-muted">
          <Link href="/forgot-password" className="hover:text-foreground">
            Request a new reset link
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        {state.error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {state.error}
          </div>
        ) : null}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium">
              New password
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className={inputClass}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1.5 block text-sm font-medium"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className={inputClass}
              placeholder="Repeat password"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-semibold"
            size="lg"
            disabled={pending}
          >
            {pending ? "Saving…" : "Update password"}
          </Button>
        </form>
      </div>
    </FanAuthCard>
  );
}
