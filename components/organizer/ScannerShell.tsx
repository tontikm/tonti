"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { logoutOrganizer, logoutOrganizerOnIdle } from "@/app/organizer/actions";
import { SessionIdleWatcher } from "@/components/auth/SessionIdleWatcher";
import { IDLE_TIMEOUTS_MS } from "@/lib/auth/idle-timeout";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_SRC, BRAND_LOGO_WIDTH, BRAND_NAME } from "@/lib/site";

type ScannerShellProps = {
  children: React.ReactNode;
  title?: string;
};

export function ScannerShell({ children, title }: ScannerShellProps) {
  return (
    <div className="organizer-theme min-h-screen bg-black">
      <SessionIdleWatcher
        idleMs={IDLE_TIMEOUTS_MS.organizer}
        onExpire={() => {
          void logoutOrganizerOnIdle();
        }}
      />
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/organizer/scan"
            aria-label="Scanner home"
            className="flex min-w-0 flex-col"
          >
            <Image
              src={BRAND_LOGO_SRC}
              alt={BRAND_NAME}
              width={BRAND_LOGO_WIDTH}
              height={BRAND_LOGO_HEIGHT}
              className="h-6 w-auto"
            />
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-300/80">
              Door scanner
            </span>
          </Link>
          <form action={logoutOrganizer}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </form>
        </div>
        {title ? (
          <div className="mx-auto max-w-3xl border-t border-white/10 px-4 py-3 sm:px-6">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
