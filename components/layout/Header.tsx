import Link from "next/link";
import { Search, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              T
            </span>
            <span className="text-xl font-bold tracking-tight">Tonti</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/events"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Events
            </Link>
            <Link
              href="/events?when=weekend"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              This Weekend
            </Link>
            <Link
              href="/events?when=tonight"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Tonight
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="hidden items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-foreground sm:flex"
          >
            <Search className="h-4 w-4" />
            Search events
          </Link>
          <Link
            href="/organizer"
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:inline-flex"
          >
            Sell tickets
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
