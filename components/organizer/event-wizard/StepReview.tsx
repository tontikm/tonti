"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Tag,
  Ticket,
} from "lucide-react";
import { OrganizerTermsAcceptance } from "@/components/organizer/OrganizerTermsAcceptance";
import { getCategoryLabel } from "@/lib/data/categories";
import { getSafeOrganizerLogoUrl } from "@/lib/images";
import { formatPrice } from "@/lib/utils";
import type { EventWizardState, OrganizerWizardDefaults } from "./types";

type StepReviewProps = {
  state: EventWizardState;
  defaults: OrganizerWizardDefaults;
  onChange: (patch: Partial<EventWizardState>) => void;
};

export function StepReview({ state, defaults, onChange }: StepReviewProps) {
  const logoUrl = defaults.logo ? getSafeOrganizerLogoUrl(defaults.logo) : null;
  const lineup = state.lineup
    .map((entry) => entry.name.trim())
    .filter(Boolean)
    .join(", ");
  const totalCapacity = state.tiers.reduce(
    (sum, tier) => sum + Number(tier.capacity || 0),
    0,
  );

  return (
    <section className="relative space-y-6">
      <div className="pointer-events-none absolute -inset-4 rounded-3xl organizer-glow opacity-60" />

      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-violet-300/80">
          Almost live
        </p>
        <h2 className="organizer-gradient-text mt-2 text-2xl font-bold sm:text-3xl">
          {state.title || "Your event"}
        </h2>
        {state.subtitle && (
          <p className="mt-2 text-base text-muted">{state.subtitle}</p>
        )}
        <p className="mt-2 font-mono text-xs text-violet-200/70">
          tonti.co.za/events/{state.slug || "your-event-slug"}
        </p>
      </div>

      {state.posterPreview && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/25 shadow-lg shadow-violet-950/40">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={state.posterPreview}
              alt="Event poster preview"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs font-medium uppercase tracking-wider text-violet-200/90">
                Poster preview
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard icon={Calendar} label="Show date" accent="violet">
          {state.showDate} at {state.showTime} SAST
          {state.endDate ? ` · ends ${state.endDate}` : ""}
        </SummaryCard>
        <SummaryCard icon={Clock} label="Doors" accent="orange">
          {state.doorsMinutes} minutes before show
        </SummaryCard>
        <SummaryCard icon={MapPin} label="Venue" accent="violet">
          {state.venueName || "—"}
        </SummaryCard>
        <SummaryCard icon={Tag} label="Category" accent="orange">
          {state.category ? getCategoryLabel(state.category) : "—"}
        </SummaryCard>
      </div>

      {(lineup || state.ageLimit || state.prohibitedItems.length > 0 || state.refundPolicy) && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold">Policies & lineup</h3>
          <div className="mt-4 space-y-3 text-sm">
            {lineup && (
              <p>
                <span className="text-muted">Lineup: </span>
                <span className="font-medium">{lineup}</span>
              </p>
            )}
            {state.ageLimit && (
              <p>
                <span className="text-muted">Age limit: </span>
                <span className="font-medium">{state.ageLimit}+</span>
              </p>
            )}
            {state.prohibitedItems.length > 0 && (
              <div>
                <p className="text-muted">Prohibited items</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {state.prohibitedItems.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-100"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {state.refundPolicy && (
              <p className="whitespace-pre-wrap text-muted">
                <span className="font-medium text-foreground">Refund: </span>
                {state.refundPolicy}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-orange-300" />
          <h3 className="text-sm font-semibold">Ticket tiers</h3>
          <span className="ml-auto text-xs text-muted">
            {totalCapacity} total capacity
          </span>
        </div>
        <ul className="mt-4 space-y-2">
          {state.tiers.map((tier) => (
            <li
              key={tier.key}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
            >
              <span className="font-medium">{tier.name}</span>
              <span className="text-muted">
                {Number(tier.price) === 0
                  ? "Free"
                  : formatPrice(Number(tier.price))}{" "}
                · {tier.capacity} tickets
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-violet-200/80">
          Presented by
        </p>
        <div className="mt-3 flex items-center gap-4">
          {logoUrl ? (
            <div className="relative h-12 w-28">
              <Image
                src={logoUrl}
                alt={defaults.name ?? "Organizer"}
                fill
                className="object-contain object-left"
                unoptimized
              />
            </div>
          ) : (
            <span className="text-lg font-semibold">
              {defaults.name ?? "Your organizer profile"}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">
          Branding comes from your{" "}
          <Link href="/organizer/profile" className="text-foreground underline">
            organizer profile
          </Link>
          . Edit your profile if this looks wrong.
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm transition-colors hover:border-violet-500/30">
        <input
          type="checkbox"
          checked={state.featured}
          onChange={(e) => onChange({ featured: e.target.checked })}
          className="h-4 w-4 rounded border-border accent-violet-500"
        />
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-300" />
          Feature on homepage carousel
        </span>
      </label>

      <OrganizerTermsAcceptance
        checked={state.acceptedTerms}
        onChange={(acceptedTerms) => onChange({ acceptedTerms })}
      />

      <p className="text-center text-sm text-muted">
        Review everything above, accept the terms, then click{" "}
        <span className="font-medium text-foreground">Publish event</span> to go
        live.
      </p>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accent: "violet" | "orange";
  children: React.ReactNode;
}) {
  const iconClass =
    accent === "violet"
      ? "bg-violet-500/20 text-violet-200"
      : "bg-orange-500/20 text-orange-200";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-1 text-sm font-medium leading-snug">{children}</p>
        </div>
      </div>
    </div>
  );
}
