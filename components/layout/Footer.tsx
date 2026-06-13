import Link from "next/link";
import { GENRES } from "@/lib/data/genres";
import { CITIES } from "@/lib/data/cities";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
                T
              </span>
              <span className="text-lg font-bold">Tonti</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The ticketing platform built for live music. Discover shows, buy
              tickets, and never miss a beat.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Browse
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/events"
                  className="text-sm text-foreground/80 hover:text-accent"
                >
                  All events
                </Link>
              </li>
              <li>
                <Link
                  href="/events?when=tonight"
                  className="text-sm text-foreground/80 hover:text-accent"
                >
                  Tonight
                </Link>
              </li>
              <li>
                <Link
                  href="/events?when=weekend"
                  className="text-sm text-foreground/80 hover:text-accent"
                >
                  This weekend
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Genres
            </h3>
            <ul className="mt-4 space-y-2">
              {GENRES.slice(0, 6).map((genre) => (
                <li key={genre.id}>
                  <Link
                    href={`/events?genre=${genre.id}`}
                    className="text-sm text-foreground/80 hover:text-accent"
                  >
                    {genre.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Cities
            </h3>
            <ul className="mt-4 space-y-2">
              {CITIES.slice(0, 6).map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/cities/${city.slug}`}
                    className="text-sm text-foreground/80 hover:text-accent"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Tonti. Music events only.
          </p>
          <div className="flex gap-6 text-xs text-muted">
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
