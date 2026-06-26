import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Mic2,
  Plus,
  ScanLine,
  Ticket,
  Users,
} from "lucide-react";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { Button } from "@/components/ui/Button";
import { getOrganizerDashboardStats } from "@/lib/organizer/stats";
import { getOrganizerByEmail, isProfileComplete } from "@/lib/organizer/profile";
import { getOrganizerSession } from "@/lib/organizer/session";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getSafeEventImageUrl } from "@/lib/images";
import { formatEventDate, formatPrice, getLowestPrice } from "@/lib/utils";

export async function generateMetadata() {
  const session = await getOrganizerSession();
  const profile = session ? await getOrganizerByEmail(session.email) : null;
  const name =
    profile?.name?.trim() ||
    session?.name?.trim() ||
    session?.email?.split("@")[0];
  return {
    title: name ? `${name} · Dashboard` : "Dashboard",
  };
}

export default async function OrganizerDashboardPage() {
  const stats = await getOrganizerDashboardStats();
  const supabaseReady = isSupabaseAdminConfigured();
  const session = await getOrganizerSession();
  const profile = session ? await getOrganizerByEmail(session.email) : null;
  const profileIncomplete = profile ? !isProfileComplete(profile) : false;
  const organizerName =
    profile?.name?.trim() ||
    session?.name?.trim() ||
    session?.email?.split("@")[0] ||
    "Organizer";

  return (
    <>
      <OrganizerPageHeader
        title={organizerName}
        description="Overview of your events, RSVPs, and check-ins."
        avatarUrl={profile?.logo}
        avatarFallback={organizerName}
        action={
          <Button href="/organizer/events/new" size="md" className="organizer-accent-btn">
            <Plus className="h-4 w-4" />
            New event
          </Button>
        }
      />

      {profileIncomplete && (
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          Complete your{" "}
          <Link href="/organizer/profile/edit" className="font-medium underline">
            organizer profile
          </Link>{" "}
          add a public slug and invoice address before your first paid event.
        </div>
      )}

      {!supabaseReady && (
        <div className="mb-8 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Connect Supabase to save events and track live RSVPs. Add{" "}
          <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
          <code className="text-foreground">.env.local</code>.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total events"
          value={String(stats.eventCount)}
          icon={Ticket}
          iconClassName="bg-violet-500/20 text-violet-200"
        />
        <StatCard
          label="Upcoming"
          value={String(stats.upcomingCount)}
          icon={CalendarClock}
          iconClassName="bg-orange-500/20 text-orange-200"
        />
        <StatCard
          label="RSVPs"
          value={String(stats.totalTickets)}
          icon={Users}
          iconClassName="bg-cyan-500/20 text-cyan-200"
        />
        <StatCard
          label="Checked in"
          value={`${stats.checkedIn}/${stats.totalTickets || 0}`}
          icon={CheckCircle2}
          iconClassName="bg-emerald-500/20 text-emerald-200"
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming events</h2>
            <Link
              href="/organizer/events"
              className="text-sm text-muted hover:text-foreground"
            >
              View all
            </Link>
          </div>

          {stats.upcomingEvents.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/15 px-5 py-8 text-center">
              <p className="text-sm text-muted">No upcoming events yet.</p>
              <Button href="/organizer/events/new" className="organizer-accent-btn mt-4" size="sm">
                <Plus className="h-4 w-4" />
                Create your first event
              </Button>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-white/10">
              {stats.upcomingEvents.map((event) => {
                const price = getLowestPrice(event.tiers);
                return (
                  <li key={event.slug} className="py-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Link
                        href={`/organizer/events/${event.slug}`}
                        className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-surface sm:h-24 sm:w-36 sm:shrink-0"
                      >
                        <Image
                          src={getSafeEventImageUrl(event.image)}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 112px, 144px"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/organizer/events/${event.slug}`}
                          className="line-clamp-2 font-medium hover:underline sm:line-clamp-1"
                        >
                          {event.title}
                        </Link>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {formatEventDate(event.date)} · {event.venue.city}
                          </span>
                        </p>
                        {price !== null && (
                          <p className="mt-1 text-sm font-mono text-muted">
                            From {formatPrice(price)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 sm:ml-auto sm:shrink-0">
                        <Link
                          href={`/organizer/events/${event.slug}/tickets`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                        >
                          <Users className="h-3.5 w-3.5" />
                          Guests
                        </Link>
                        <Link
                          href={`/organizer/events/${event.slug}/scan`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                        >
                          <ScanLine className="h-3.5 w-3.5" />
                          Scan
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-3">
            <ActionCard
              href="/organizer/events/new"
              icon={Plus}
              title="Create event"
              description="Publish a new show with tiers and poster"
            />
            <ActionCard
              href="/organizer/events"
              icon={Ticket}
              title="Manage events"
              description="Edit, feature, or delete your listings"
            />
            <ActionCard
              href="/organizer/venues/new"
              icon={MapPin}
              title="Add venue"
              description="Register a new venue for your events"
            />
            <ActionCard
              href="/organizer/artists/new"
              icon={Mic2}
              title="Add artist"
              description="Add performers to line up on events"
            />
            {stats.upcomingEvents[0] && (
              <ActionCard
                href={`/organizer/events/${stats.upcomingEvents[0].slug}/scan`}
                icon={ScanLine}
                title="Open door scanner"
                description={`Check in guests for ${stats.upcomingEvents[0].title}`}
              />
            )}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              At a glance
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>{stats.orderCount} total orders</li>
              <li>{stats.pendingCheckIn} guests not yet checked in</li>
              <li>{stats.eventCount} events on Spotra</li>
            </ul>
          </div>
        </section>
      </div>

      {stats.pastEvents.length > 0 && (
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent past events</h2>
            <Link
              href="/organizer/events"
              className="text-sm text-muted hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-white/10">
            {stats.pastEvents.map((event) => (
              <li key={event.slug} className="py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href={`/organizer/events/${event.slug}`}
                    className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-surface sm:h-24 sm:w-36 sm:shrink-0"
                  >
                    <Image
                      src={getSafeEventImageUrl(event.image)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 112px, 144px"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/organizer/events/${event.slug}`}
                      className="line-clamp-2 font-medium hover:underline sm:line-clamp-1"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {formatEventDate(event.date)} · {event.venue.city}
                      </span>
                    </p>
                  </div>
                  <Link
                    href={`/organizer/events/${event.slug}/report`}
                    className="inline-flex items-center justify-center gap-1.5 self-start rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground sm:ml-auto sm:shrink-0"
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    Report
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName = "bg-white/10 text-muted",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </p>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-xl border border-white/10 p-4 transition-colors hover:border-white/25 hover:bg-white/[0.03]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
    </Link>
  );
}
