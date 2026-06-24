"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Banknote,
  Calendar,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic2,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { AdminSession } from "@/lib/admin/session";
import { logoutAdmin, logoutAdminOnIdle } from "@/app/admin/actions";
import { SessionIdleWatcher } from "@/components/auth/SessionIdleWatcher";
import { IDLE_TIMEOUTS_MS } from "@/lib/auth/idle-timeout";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_SRC, BRAND_LOGO_WIDTH, BRAND_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  session: AdminSession;
  children: React.ReactNode;
};

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/organizers", label: "Organizers", icon: Users },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/artists", label: "Artists", icon: Mic2 },
  { href: "/admin/carousel", label: "Carousel", icon: ImageIcon },
  { href: "/admin/payouts", label: "Payouts", icon: Banknote },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

export function AdminShell({ session, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sidebar = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="block shrink-0 px-5 py-6">
        <Link href="/admin" className="inline-block">
          <Image
            src={BRAND_LOGO_SRC}
            alt={BRAND_NAME}
            width={BRAND_LOGO_WIDTH}
            height={BRAND_LOGO_HEIGHT}
            className="h-7 w-auto"
          />
        </Link>
        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-amber-300/80">
          Platform admin
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pt-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              isActive(item.href, item.exact)
                ? "bg-amber-600 text-black shadow-md shadow-amber-900/30"
                : "text-muted hover:bg-white/5 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <p className="mb-2 truncate px-3 text-xs text-muted">
          {session.name ?? session.email}
        </p>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <SessionIdleWatcher
        idleMs={IDLE_TIMEOUTS_MS.admin}
        onExpire={() => {
          void logoutAdminOnIdle();
        }}
      />
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-amber-500/10 bg-gradient-to-b from-amber-950/20 to-black lg:flex lg:min-h-screen lg:flex-col">
          {sidebar}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur-sm lg:hidden">
            <Link href="/admin" className="flex flex-col">
              <Image
                src={BRAND_LOGO_SRC}
                alt={BRAND_NAME}
                width={BRAND_LOGO_WIDTH}
                height={BRAND_LOGO_HEIGHT}
                className="h-6 w-auto"
              />
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-300/80">
                Admin
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {mobileOpen && (
            <div className="fixed inset-0 z-[80] lg:hidden">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-amber-500/10 bg-gradient-to-b from-amber-950/20 to-black shadow-2xl">
                <div className="flex shrink-0 justify-end p-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-white/10"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {sidebar}
              </aside>
            </div>
          )}

          <main className="flex-1 bg-surface/30 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
