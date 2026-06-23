"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  signInWithEmail,
  signUpWithEmail,
  type AuthState,
} from "@/app/auth/actions";
import { FanAuthCard } from "@/components/auth/FanAuthCard";
import { OrganizerFanAuthNotice } from "@/components/auth/OrganizerFanAuthNotice";
import { Button } from "@/components/ui/Button";

type CheckoutAuthGateProps = {
  returnTo: string;
  authConfigured: boolean;
  organizerEmail?: string | null;
  footer?: ReactNode;
  initialError?: string;
};

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export function CheckoutAuthGate({
  returnTo,
  authConfigured,
  organizerEmail,
  footer,
  initialError,
}: CheckoutAuthGateProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState<
    AuthState,
    FormData
  >(signInWithEmail, {});
  const [signupState, signupAction, signupPending] = useActionState<
    AuthState,
    FormData
  >(signUpWithEmail, {});

  const state = mode === "login" ? loginState : signupState;
  const pending = loginPending || signupPending;

  const title = organizerEmail ? "Sign in as a fan" : "Sign in to continue";
  const description = organizerEmail
    ? "Ticket orders need a fan account. Confirm your email if you just signed up."
    : "Create a free Spotra account or sign in to complete your ticket order.";

  return (
    <FanAuthCard
      title={title}
      description={description}
      notice={
        organizerEmail ? (
          <OrganizerFanAuthNotice
            organizerEmail={organizerEmail}
            fanLoginHref={`/login?next=${encodeURIComponent(returnTo)}`}
          />
        ) : undefined
      }
      footer={footer}
    >
      <div className="space-y-6">
        {!authConfigured && (
          <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
            Fan sign-in needs{" "}
            <code className="text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            in <code className="text-foreground">.env.local</code>.
          </div>
        )}

        <div className="flex rounded-full border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === "login"
                ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-100"
                : "text-muted hover:text-foreground"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-100"
                : "text-muted hover:text-foreground"
            }`}
          >
            Sign up
          </button>
        </div>

        {initialError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {initialError}
          </div>
        ) : null}

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

        {mode === "login" ? (
          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="returnTo" value={returnTo} />
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium"
              >
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                minLength={8}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="mt-2 w-full font-semibold"
              size="lg"
              disabled={!authConfigured || pending}
            >
              {loginPending ? "Signing in…" : "Sign in & continue"}
            </Button>
          </form>
        ) : (
          <form action={signupAction} className="space-y-4">
            <input type="hidden" name="returnTo" value={returnTo} />
            <div>
              <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium">
                Full name
              </label>
              <input
                id="signup-name"
                name="name"
                required
                autoComplete="name"
                className={inputClass}
                placeholder="Thabo M."
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="signup-password"
                className="mb-1.5 block text-sm font-medium"
              >
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className={inputClass}
                placeholder="At least 8 characters"
              />
            </div>
            <Button
              type="submit"
              className="mt-2 w-full font-semibold"
              size="lg"
              disabled={!authConfigured || pending}
            >
              {signupPending ? "Creating account…" : "Create account & continue"}
            </Button>
          </form>
        )}
      </div>
    </FanAuthCard>
  );
}
