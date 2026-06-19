"use client";

import { signOut } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

type FanSignOutButtonProps = {
  returnTo?: string;
  className?: string;
  variant?: "button" | "nav";
};

export function FanSignOutButton({
  returnTo = "/",
  className,
  variant = "button",
}: FanSignOutButtonProps) {
  return (
    <form action={signOut.bind(null, returnTo)}>
      <button
        type="submit"
        className={cn(
          variant === "nav"
            ? "w-full rounded-xl px-3 py-3 text-left text-base text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            : "rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10",
          className,
        )}
      >
        Sign out
      </button>
    </form>
  );
}
