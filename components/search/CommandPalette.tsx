"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  CalendarDays,
  MapPin,
  Music,
  Search,
  Sparkles,
  Ticket,
} from "lucide-react";
import type { SearchItem, SearchItemType } from "@/lib/search";

type CommandPaletteProps = {
  items: SearchItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TYPE_META: Record<
  SearchItemType,
  { label: string; icon: typeof Ticket }
> = {
  event: { label: "Events", icon: Ticket },
  artist: { label: "Artists", icon: Music },
  venue: { label: "Venues", icon: MapPin },
  city: { label: "Cities", icon: MapPin },
};

const QUICK_LINKS = [
  { label: "Tonight", href: "/events?when=tonight", icon: CalendarDays },
  { label: "This weekend", href: "/events?when=weekend", icon: CalendarDays },
  { label: "Free entry", href: "/events?free=1", icon: Sparkles },
  { label: "All events", href: "/events", icon: Ticket },
];

export function CommandPalette({
  items,
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const grouped = useMemo(() => {
    const order: SearchItemType[] = ["event", "artist", "venue", "city"];
    return order
      .map((type) => ({
        type,
        items: items.filter((item) => item.type === type),
      }))
      .filter((group) => group.items.length > 0);
  }, [items]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <Command
        label="Search Tonti"
        shouldFilter
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-3)]"
        filter={(value, search) => {
          if (!search) return 1;
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
        }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search events, artists, venues, cities…"
            className="h-14 w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
            No results for &ldquo;{query}&rdquo;.
          </Command.Empty>

          {!query && (
            <Command.Group
              heading="Quick links"
              className="px-1 pb-2 text-xs font-medium uppercase tracking-wider text-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
            >
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Command.Item
                    key={link.href}
                    value={`quick ${link.label}`}
                    onSelect={() => go(link.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground aria-selected:bg-surface-hover"
                  >
                    <Icon className="h-4 w-4 text-muted" />
                    {link.label}
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {grouped.map((group) => {
            const meta = TYPE_META[group.type];
            const Icon = meta.icon;
            return (
              <Command.Group
                key={group.type}
                heading={meta.label}
                className="px-1 pb-2 text-xs font-medium uppercase tracking-wider text-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
              >
                {group.items.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.title} ${item.subtitle ?? ""} ${item.keywords}`}
                    onSelect={() => go(item.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-surface-hover"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-foreground">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="block truncate text-xs text-muted">
                          {item.subtitle}
                        </span>
                      )}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            );
          })}
        </Command.List>
      </Command>
    </div>
  );
}
