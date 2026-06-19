import Link from "next/link";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import type { Venue } from "@/lib/types";

type VenueMapProps = {
  venue: Venue;
};

function buildMapQuery(venue: Venue): string {
  return encodeURIComponent(
    `${venue.name}, ${venue.address}, ${venue.city}, ${venue.province}, South Africa`,
  );
}

export function VenueMap({ venue }: VenueMapProps) {
  const query = buildMapQuery(venue);
  const embedUrl = `https://maps.google.com/maps?q=${query}&hl=en&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Location
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{venue.name}</h2>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
              <span>
                {venue.address}
                <br />
                {venue.city}, {venue.province}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:border-foreground/40 hover:bg-surface-hover"
            >
              <Navigation className="h-4 w-4" />
              Get directions
            </Link>
            <Link
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Maps
            </Link>
          </div>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-black">
          <div className="relative aspect-[21/9] min-h-[240px] w-full sm:min-h-[320px]">
            <iframe
              title={`Map of ${venue.name}`}
              src={embedUrl}
              className="venue-map-embed absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
