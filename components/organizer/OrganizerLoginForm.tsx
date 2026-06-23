"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginOrganizer, type LoginState } from "@/app/organizer/actions";
import { OrganizerAuthCard } from "@/components/organizer/OrganizerAuthCard";
import { OrganizerPublicShell } from "@/components/organizer/OrganizerPublicShell";
import { Button } from "@/components/ui/Button";
import { LEGAL_HUB_LINK } from "@/lib/site";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-white/40 focus:outline-none";

export function OrganizerLoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginOrganizer,
    {},
  );

  return (
    <OrganizerPublicShell activeAuth="login">
      <OrganizerAuthCard
        backLink={
          <Link
            href="/for-organizers"
            className="mb-6 inline-block text-sm text-muted hover:text-foreground"
          >
            ← Why Spotra for organizers?
          </Link>
        }
        title="Organizer login"
        description="Manage your events, RSVPs, and door check-ins with your organizer account."
        footer={
          <div className="space-y-4">
            <p className="text-center text-sm text-muted">
              New organizer?{" "}
              <Link href="/organizer/register" className="text-foreground hover:underline">
                Create an account
              </Link>
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted">
              <Link href={LEGAL_HUB_LINK.href} className="hover:text-foreground">
                {LEGAL_HUB_LINK.label}
              </Link>
            </div>
          </div>
        }
      >
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
              {state.error}
            </div>
          )}

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

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              className={inputClass}
            />
          </div>

          <Button type="submit" className="organizer-accent-btn w-full" size="lg" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </OrganizerAuthCard>
    </OrganizerPublicShell>
  );
}
