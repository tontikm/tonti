"use client";

import { useActionState } from "react";
import Image from "next/image";
import { loginAdmin, type AdminLoginState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { BRAND_LOGO_SRC, BRAND_NAME } from "@/lib/site";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-white/40 focus:outline-none";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<AdminLoginState, FormData>(
    loginAdmin,
    {},
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface/50 p-8">
        <Image
          src={BRAND_LOGO_SRC}
          alt={BRAND_NAME}
          width={598}
          height={215}
          className="mx-auto h-8 w-auto"
        />
        <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-[0.25em] text-muted">
          Platform admin
        </p>
        <h1 className="mt-6 text-center text-xl font-semibold">Admin login</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Sign in to approve organizers, feature events, and review orders.
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          {state.error && (
            <p className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              {state.error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs text-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs text-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
