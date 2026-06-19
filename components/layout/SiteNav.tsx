"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FanSignOutButton } from "@/components/auth/FanSignOutButton";
import { LEGAL_HUB_LINK } from "@/lib/site";
import { SearchBar } from "./SearchBar";

const LINKS = [
  { href: "/events", label: "Events" },
  { href: "/events?when=weekend", label: "This Weekend" },
  { href: "/events?when=tonight", label: "Tonight" },
  { href: "/events?free=1", label: "Free entry" },
  { href: "/help", label: "Help" },
  { href: LEGAL_HUB_LINK.href, label: LEGAL_HUB_LINK.label },
];

type SiteNavProps = {
  fanNavLink: { href: string; label: string } | null;
  fanSignedIn: boolean;
};

export function SiteNav({ fanNavLink, fanSignedIn }: SiteNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-white/10"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(100vw,22rem)] flex-col gap-6 border-l border-white/10 bg-black p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SearchBar onSubmitted={() => setOpen(false)} />

            <nav className="flex flex-col gap-1">
              {fanNavLink && (
                <Link
                  href={fanNavLink.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-white/5"
                >
                  {fanNavLink.label}
                </Link>
              )}
              {fanSignedIn ? (
                <div onClick={() => setOpen(false)}>
                  <FanSignOutButton variant="nav" />
                </div>
              ) : null}
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base text-foreground transition-colors hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
