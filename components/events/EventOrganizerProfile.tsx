import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import type { OrganizerProfile } from "@/lib/types";
import { getSafeOrganizerLogoUrl } from "@/lib/images";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

type EventOrganizerProfileProps = {
  organizer: OrganizerProfile;
};

export function EventOrganizerProfile({ organizer }: EventOrganizerProfileProps) {
  const logoUrl = organizer.logo
    ? getSafeOrganizerLogoUrl(organizer.logo)
    : null;
  const displayName = organizer.name ?? "Organizer";
  const hasSocial = Boolean(organizer.websiteUrl || organizer.instagramUrl);

  return (
    <section
      id="organizer"
      className="mt-12 scroll-mt-32 rounded-2xl border border-border bg-surface p-6"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        Presented by
      </p>

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        {logoUrl ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-black">
            <Image
              src={logoUrl}
              alt={displayName}
              fill
              className="object-contain p-2"
              sizes="80px"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-hover text-2xl font-bold text-muted">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {organizer.slug ? (
            <Link
              href={`/organizers/${organizer.slug}`}
              className="text-xl font-semibold hover:text-brand"
            >
              {displayName}
            </Link>
          ) : (
            <p className="text-xl font-semibold">{displayName}</p>
          )}

          {organizer.bio && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {organizer.bio}
            </p>
          )}

          {hasSocial && (
            <div className="mt-4 flex flex-wrap gap-2">
              {organizer.websiteUrl && (
                <a
                  href={organizer.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${displayName} website`}
                  className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {organizer.instagramUrl && (
                <a
                  href={organizer.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${displayName} on Instagram`}
                  className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {organizer.slug && (
            <Link
              href={`/organizers/${organizer.slug}`}
              className="mt-4 inline-block text-sm text-muted hover:text-foreground"
            >
              View all events from {displayName} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
