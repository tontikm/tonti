"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerOrganizer, type LoginState } from "@/app/organizer/actions";
import { OrganizerAuthCard } from "@/components/organizer/OrganizerAuthCard";
import { OrganizerPublicShell } from "@/components/organizer/OrganizerPublicShell";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-white/40 focus:outline-none";

export function OrganizerRegisterForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    registerOrganizer,
    {},
  );

  return (
    <OrganizerPublicShell>
      <OrganizerAuthCard
        backLink={
          <Link
            href="/for-organizers"
            className="mb-6 inline-block text-sm text-muted hover:text-foreground"
          >
            ← Why Spotra for organizers?
          </Link>
        }
        title="Create organizer account"
        description="Register to list events, manage venues, and scan tickets at the door."
        footer={
          <p className="text-center text-sm text-muted">
            Already registered?{" "}
            <Link href="/organizer/login" className="text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Your name
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Promoter name"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Work email *
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

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password *
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
              Confirm password *
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

          <Button type="submit" className="organizer-accent-btn w-full" size="lg" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </OrganizerAuthCard>
    </OrganizerPublicShell>
  );
}
