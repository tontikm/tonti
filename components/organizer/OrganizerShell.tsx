"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Mic2,
  Plus,
  ScanLine,
  Ticket,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import type { OrganizerSession } from "@/lib/organizer/session";
import { logoutOrganizer } from "@/app/organizer/actions";
import { getSafeOrganizerLogoUrl } from "@/lib/images";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_SRC, BRAND_LOGO_WIDTH, BRAND_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type OrganizerShellProps = {
  session: OrganizerSession;
  children: React.ReactNode;
};

const NAV = [
  { href: "/organizer", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/organizer/events", label: "Events", icon: Ticket },
  { href: "/organizer/events/new", label: "New event", icon: Plus },
  { href: "/organizer/venues", label: "Venues", icon: MapPin },
  { href: "/organizer/artists", label: "Artists", icon: Mic2 },
  { href: "/organizer/profile", label: "Profile", icon: User },
];

export function OrganizerShell({ session, children }: OrganizerShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="block px-5 py-6">
        <Image
          src={BRAND_LOGO_SRC}
          alt={BRAND_NAME}
          width={BRAND_LOGO_WIDTH}
          height={BRAND_LOGO_HEIGHT}
          className="h-7 w-auto"
        />
        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-violet-300/80">
          Organizer
        </p>
      </Link>

      <nav className="flex-1 space-y-1 px-3 pt-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              isActive(item.href, item.exact)
                ? "bg-violet-600 text-white shadow-md shadow-violet-900/30"
                : "text-muted hover:bg-white/5 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          View site
        </Link>
        <form action={logoutOrganizer}>
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
    <div className="organizer-theme min-h-screen bg-black">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-violet-500/10 bg-gradient-to-b from-violet-950/20 to-black lg:block">
          {sidebar}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur-sm lg:hidden">
            <Link href="/" className="flex flex-col">
              <Image
                src={BRAND_LOGO_SRC}
                alt={BRAND_NAME}
                width={BRAND_LOGO_WIDTH}
                height={BRAND_LOGO_HEIGHT}
                className="h-6 w-auto"
              />
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-300/80">
                Organizer
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
              <aside className="absolute left-0 top-0 h-full w-72 border-r border-violet-500/10 bg-gradient-to-b from-violet-950/20 to-black shadow-2xl">
                <div className="flex justify-end p-3">
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

export function OrganizerPageHeader({
  title,
  description,
  action,
  avatarUrl,
  avatarFallback,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  avatarUrl?: string | null;
  avatarFallback?: string;
}) {
  const showAvatar = Boolean(avatarUrl?.trim() || avatarFallback);
  const initial =
    avatarFallback?.trim().charAt(0).toUpperCase() ||
    title.trim().charAt(0).toUpperCase() ||
    "O";

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {showAvatar && (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-surface">
            {avatarUrl?.trim() ? (
              <Image
                src={getSafeOrganizerLogoUrl(avatarUrl)}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-violet-600/20 text-lg font-semibold text-violet-200">
                {initial}
              </div>
            )}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-muted">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function OrganizerQuickLinks({ eventSlug }: { eventSlug?: string }) {
  if (!eventSlug) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/organizer/events/${eventSlug}/tickets`}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted hover:text-foreground"
      >
        <Ticket className="h-3.5 w-3.5" />
        Guest list
      </Link>
      <Link
        href={`/organizer/events/${eventSlug}/scan`}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted hover:text-foreground"
      >
        <ScanLine className="h-3.5 w-3.5" />
        Scanner
      </Link>
    </div>
  );
}
