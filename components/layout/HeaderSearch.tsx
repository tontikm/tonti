"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { SearchBar } from "./SearchBar";

export function HeaderSearch() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-white/10"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/80 px-4 pt-24 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="absolute inset-0"
          />
          <div className="relative z-10 w-full max-w-xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-foreground"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SearchBar
              autoFocus
              className="border-white/20 bg-black"
              onSubmitted={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
