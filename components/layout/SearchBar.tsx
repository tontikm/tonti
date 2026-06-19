"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
};

export function SearchBar({ className, autoFocus, onSubmitted }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
    onSubmitted?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm transition-colors focus-within:border-foreground/40",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted" />
      <input
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search events, artists, venues"
        aria-label="Search events"
        className="w-full bg-transparent text-foreground placeholder:text-muted focus:outline-none"
      />
    </form>
  );
}
