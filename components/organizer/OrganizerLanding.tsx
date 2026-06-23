import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ScanLine,
  Ticket,
  Users,
} from "lucide-react";
import { OrganizerFeaturePreview } from "@/components/organizer/OrganizerFeaturePreview";
import { OrganizerFeeTiers } from "@/components/organizer/OrganizerFeeTiers";
import { OrganizerHeroVisual } from "@/components/organizer/OrganizerHeroVisual";
import { OrganizerPhotoStrip } from "@/components/organizer/OrganizerPhotoStrip";
import { OrganizerPublicShell } from "@/components/organizer/OrganizerPublicShell";
import { Button } from "@/components/ui/Button";

export type OrganizerHeroEvent = {
  title: string;
  image: string;
};

const PILLARS = [
  {
    icon: Ticket,
    title: "Ticketing",
    description:
      "Free and paid tiers, capacity limits, and Payfast checkout when you are ready to sell online.",
    iconBg: "bg-violet-500/20 text-violet-200",
    topLine: "from-violet-500/60 to-transparent",
    glow: "from-violet-500/20 to-transparent",
  },
  {
    icon: ScanLine,
    title: "Door scan",
    description:
      "Every ticket gets a QR code. Scan at the door from your dashboard or enter codes manually.",
    iconBg: "bg-orange-500/20 text-orange-200",
    topLine: "from-orange-500/60 to-transparent",
    glow: "from-orange-500/15 to-transparent",
  },
  {
    icon: CalendarDays,
    title: "Event setup",
    description:
      "Posters, categories, lineups, venues, and artists. Everything you need to publish a show.",
    iconBg: "bg-pink-500/20 text-pink-200",
    topLine: "from-pink-500/60 to-transparent",
    glow: "from-pink-500/15 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Sales & check-ins",
    description:
      "Track orders, see who is checked in, and monitor valid vs used tickets in real time.",
    iconBg: "bg-cyan-500/20 text-cyan-200",
    topLine: "from-cyan-500/60 to-transparent",
    glow: "from-cyan-500/15 to-transparent",
  },
];

const SECTIONS = [
  {
    eyebrow: "Publish",
    title: "Get your event live on Spotra",
    preview: "publish" as const,
    border: "border-l-violet-500",
    bullets: [
      "Create events with dates, venues, and lineups",
      "Choose a category: nightlife, festival, music, or lifestyle",
      "Set ticket tiers with capacity and pricing",
      "Appear in Spotra discovery: homepage, categories, and cities",
    ],
  },
  {
    eyebrow: "Sell",
    title: "Turn RSVPs into ticket sales",
    preview: "sell" as const,
    border: "border-l-orange-500",
    bullets: [
      "Fans sign in to complete checkout securely",
      "Accept online payments via Payfast when configured",
      "Offer free tiers with instant QR confirmation",
      "Paid tiers can use pay-at-door until online payments are set up",
    ],
  },
  {
    eyebrow: "Run the door",
    title: "Check in guests without the chaos",
    preview: "door" as const,
    border: "border-l-cyan-500",
    bullets: [
      "Open the door scanner from your event dashboard",
      "Scan QR codes or look up ticket codes on the spot",
      "See valid, used, and checked-in status instantly",
      "Manage venues and artists in one organizer account",
    ],
  },
];

function OrganizerCtas({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      <Button href="/organizer/register" size="lg" className="organizer-accent-btn">
        Sign up free
      </Button>
      <Button href="/organizer/login" variant="secondary" size="lg">
        Log in
      </Button>
    </div>
  );
}

type OrganizerLandingProps = {
  heroEvents: OrganizerHeroEvent[];
};

export function OrganizerLanding({ heroEvents }: OrganizerLandingProps) {
  return (
    <OrganizerPublicShell>
      <OrganizerPhotoStrip events={heroEvents} />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 organizer-glow" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
          <div>
            <p className="inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-200">
              Spotra for Organizers
            </p>
            <h1 className="organizer-gradient-text mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Promote your show on Spotra
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Built for South African promoters, venues, and artists. List events,
              sell tickets, and scan guests at the door, all in one place.
            </p>
            <OrganizerCtas className="mt-8" />
          </div>
          <OrganizerHeroVisual events={heroEvents} />
        </div>
      </section>

      <section className="relative border-b border-white/10 bg-zinc-950 organizer-grid-bg-violet">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500/60 via-violet-500/20 to-transparent" />
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl pl-4 sm:pl-6">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ticketing and door ops in one platform
            </h2>
            <p className="mt-4 text-muted">
              You should not need separate tools to publish a show, sell tickets,
              and run check-in. Spotra brings the essentials together so you can
              focus on the event.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-violet-500/20 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-violet-900/20"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${pillar.topLine}`}
                />
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${pillar.glow} opacity-60 transition-opacity group-hover:opacity-100`}
                />
                <div
                  className={`relative inline-flex rounded-xl p-3 ${pillar.iconBg}`}
                >
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="relative mt-5 text-lg font-semibold">{pillar.title}</h3>
                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center gap-3 text-sm text-muted">
            <Users className="h-4 w-4 text-violet-400" />
            <span>Everything you need to run a show on Spotra</span>
          </div>
          <div className="relative space-y-20">
            <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-violet-500/20 via-orange-500/10 to-transparent lg:block" />
            {SECTIONS.map((section, index) => (
              <div
                key={section.eyebrow}
                className={`relative grid gap-10 lg:grid-cols-2 lg:items-center ${
                  index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className={`border-l-2 pl-5 ${section.border}`}>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                    {section.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                    {section.title}
                  </h3>
                  <ul className="mt-6 space-y-3">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-sm leading-relaxed text-muted"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/70" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <OrganizerFeaturePreview variant={section.preview} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <OrganizerFeeTiers />

      <section className="relative border-b border-white/10 bg-gradient-to-b from-violet-950/20 to-black">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-violet-600/10 blur-3xl sm:h-96 sm:w-96" />
          <div className="absolute h-48 w-48 rounded-full bg-orange-500/8 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-[28px] border border-transparent bg-black/40 p-[1px] backdrop-blur-sm [background:linear-gradient(black,black)_padding-box,linear-gradient(135deg,rgba(124,58,237,0.4),rgba(249,115,22,0.3),transparent)_border-box] sm:p-12">
            <div className="rounded-[27px] bg-black/60 p-8 text-center sm:p-10">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Ready to list your next event?
              </h2>
              <p className="mt-4 text-muted">
                Create your organizer account in minutes. No setup fees. See
                pricing above.
              </p>
              <OrganizerCtas className="mt-8 justify-center" />
              <p className="mt-8">
                <Link href="/events" className="text-sm text-muted hover:text-foreground">
                  Browse events on Spotra →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </OrganizerPublicShell>
  );
}
