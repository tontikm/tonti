"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { SearchItem } from "@/lib/search";
import { CommandPalette } from "@/components/search/CommandPalette";

type HeaderSearchProps = {
  searchItems: SearchItem[];
};

export function HeaderSearch({ searchItems }: HeaderSearchProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-full px-2.5 text-foreground transition-colors hover:bg-white/10 sm:border sm:border-border sm:bg-surface sm:px-3 sm:hover:border-foreground/40"
        aria-label="Search"
      >
        <Search className="h-5 w-5 sm:h-4 sm:w-4" />
        <span className="hidden text-sm text-muted sm:inline">Search</span>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted lg:inline">
          ⌘K
        </kbd>
      </button>

      <CommandPalette
        items={searchItems}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
