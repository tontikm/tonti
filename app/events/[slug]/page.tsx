import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
} from "lucide-react";
import { VenueMap } from "@/components/events/VenueMap";
import { TicketTierSelector } from "@/components/events/TicketTierSelector";
import { EventSectionNav } from "@/components/events/EventSectionNav";
import { RecordRecentlyViewed } from "@/components/events/RecordRecentlyViewed";
import { OrganizerEventManagePanel } from "@/components/organizer/OrganizerEventManagePanel";
import { ShareButtons } from "@/components/events/ShareButtons";
import { EventFollowButton } from "@/components/events/EventFollowButton";
import { EventOrganizerProfile } from "@/components/events/EventOrganizerProfile";
import { Badge } from "@/components/ui/Badge";
import { getEventBySlug, getAllEvents, getPublicEventBySlug } from "@/lib/data/events";
import { isEventPubliclyVisible, getApprovedOrganizerIds } from "@/lib/admin/data";
import { isEventFollowed, followEvent } from "@/lib/fan/follows";
import { getOrganizerByEmail, getOrganizerById } from "@/lib/organizer/profile";
import { isOwnOrganizerEvent } from "@/lib/organizer/ownership";
import { getOrganizerSession } from "@/lib/organizer/session";
import { getCategoryColor, getCategoryLabel } from "@/lib/data/categories";
import {
  getSafeArtistImageUrl,
  getSafeEventImageUrl,
} from "@/lib/images";
import { getFanUser } from "@/lib/auth/session";
import { isFanAuthConfigured } from "@/lib/supabase/server-auth";
import {
  formatAgeRange,
  formatDateRange,
  formatEventDate,
  formatEventTime,
  getEventAvailability,
  isAdultsOnlyAge,
  isPastEvent,
} from "@/lib/utils";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  return (await getAllEvents()).map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const followOnReturn = query.follow === "1";
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const organizerSession = await getOrganizerSession();
  const fanUser = await getFanUser();
  const organizerProfile = organizerSession
    ? await getOrganizerByEmail(organizerSession.email)
    : null;
  const isOwnEvent = isOwnOrganizerEvent(
    event,
    organizerSession,
    {
      id: organizerProfile?.id,
      name: organizerProfile?.name,
    },
  );

  if (!isOwnEvent) {
    const approvedIds = await getApprovedOrganizerIds();
    if (!isEventPubliclyVisible(event, approvedIds)) {
      notFound();
    }
  }
  const organizerEmailForTickets =
    organizerSession && !fanUser && !isOwnEvent
      ? organizerSession.email
      : null;
  const organizerEmailForFollow =
    organizerSession && !fanUser ? organizerSession.email : null;

  const organizer = event.organizerId
    ? await getOrganizerById(event.organizerId)
    : null;

  const fanAuthEnabled = isFanAuthConfigured();
  let initialFollowing =
    fanUser && fanAuthEnabled
      ? await isEventFollowed(fanUser.id, event.slug)
      : false;

  if (fanUser && fanAuthEnabled && followOnReturn && !initialFollowing) {
    const result = await followEvent(fanUser.id, event.slug);
    if (result.ok) {
      redirect(`/events/${event.slug}`);
    }
  }

  const availability = getEventAvailability(event.tiers);
  const ended = isPastEvent(event);
  const showOrganizerOnEvent =
    Boolean(event.showOrganizerProfile && organizer);

  return (
    <div className={!isOwnEvent && !ended ? "pb-24" : undefined}>
      <div className="relative">
        <div className="relative h-[40vh] min-h-[280px] max-h-[480px] w-full overflow-hidden">
          <Image
            src={getSafeEventImageUrl(event.image)}
            alt={event.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-24">
            <Link
              href={isOwnEvent ? "/organizer" : "/events"}
              className="relative z-10 mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {isOwnEvent ? "Back to dashboard" : "Back to events"}
            </Link>

            {!isOwnEvent && <RecordRecentlyViewed slug={event.slug} />}
            {!isOwnEvent && (
              <EventSectionNav
                sections={[
                  { id: "about", label: "About" },
                  ...(event.artists.length > 0
                    ? [{ id: "lineup", label: "Lineup" }]
                    : []),
                  ...(showOrganizerOnEvent
                    ? [{ id: "organizer", label: "Organizer" }]
                    : []),
                  { id: "tickets", label: "Tickets" },
                  { id: "location", label: "Location" },
                ]}
              />
            )}

            <div className="flex flex-col gap-10 lg:grid lg:grid-cols-3">
            <div className="order-2 lg:order-1 lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Badge color={getCategoryColor(event.category)}>
                  {getCategoryLabel(event.category)}
                </Badge>
                {formatAgeRange(event.ageLimit, event.ageMax) && (
                  <Badge className="border border-border bg-surface text-muted">
                    {isAdultsOnlyAge(event.ageLimit, event.ageMax)
                      ? `${formatAgeRange(event.ageLimit, event.ageMax)} · Adults only`
                      : formatAgeRange(event.ageLimit, event.ageMax)}
                  </Badge>
                )}
                {event.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    className="border border-border bg-surface text-muted"
                  >
                    {tag}
                  </Badge>
                ))}
                {availability === "sold-out" && (
                  <Badge className="border border-red-500/30 bg-red-500/10 text-red-300">
                    Sold out
                  </Badge>
                )}
                {availability === "limited" && (
                  <Badge className="border border-amber-500/30 bg-amber-500/10 text-amber-300">
                    Almost gone
                  </Badge>
                )}
                {availability === "available" && (
                  <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    Available
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>
              {event.subtitle && (
                <p className="mt-2 text-lg text-muted">{event.subtitle}</p>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoRow
                  icon={Calendar}
                  label="Date"
                  value={
                    event.endDate
                      ? formatDateRange(event.date, event.endDate)
                      : formatEventDate(event.date)
                  }
                />
                <InfoRow
                  icon={Clock}
                  label="Show time"
                  value={`Doors ${formatEventTime(event.doorsTime)} · Show ${formatEventTime(event.showTime)}`}
                />
                <InfoRow
                  icon={MapPin}
                  label="Venue"
                  value={
                    <Link
                      href={`/venues/${event.venue.slug}`}
                      className="hover:text-accent"
                    >
                      {event.venue.name}
                    </Link>
                  }
                  sub={`${event.venue.address}`}
                />
                <InfoRow
                  icon={Users}
                  label="Lineup"
                  value={
                    <span className="flex flex-wrap gap-1">
                      {event.artists.map((artist, i) => (
                        <span key={artist.slug}>
                          <Link
                            href={`/artists/${artist.slug}`}
                            className="hover:text-accent"
                          >
                            {artist.name}
                          </Link>
                          {i < event.artists.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                  }
                />
              </div>

              <div id="about" className="mt-10 scroll-mt-32">
                <h2 className="text-xl font-semibold">About this show</h2>
                <p className="mt-3 leading-relaxed text-muted">
                  {event.description}
                </p>
                {isAdultsOnlyAge(event.ageLimit, event.ageMax) && (
                  <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                    This is an adult event. Valid ID proving you are{" "}
                    {formatAgeRange(event.ageLimit, event.ageMax)} may be required
                    at the door.
                  </p>
                )}

                {event.prohibitedItems && event.prohibitedItems.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold">Prohibited items</h3>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
                      {event.prohibitedItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-sm font-semibold">Refund policy</h3>
                  {event.refundPolicy ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                      {event.refundPolicy}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted">
                      <Link
                        href="/legal/refunds"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        Read Tonti&apos;s refund policy
                      </Link>
                    </p>
                  )}
                </div>

                {organizer?.slug && organizer.name && !showOrganizerOnEvent && (
                  <p className="mt-6 text-sm text-muted">
                    Presented by{" "}
                    <Link
                      href={`/organizers/${organizer.slug}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {organizer.name}
                    </Link>
                  </p>
                )}
              </div>

              <div className="mt-8">
                <div className="flex flex-wrap items-center gap-2">
                  {fanAuthEnabled ? (
                    <EventFollowButton
                      eventSlug={event.slug}
                      initialFollowing={initialFollowing}
                      isSignedIn={Boolean(fanUser)}
                      organizerEmail={organizerEmailForFollow}
                    />
                  ) : null}
                  <ShareButtons title={event.title} />
                </div>
              </div>

              {showOrganizerOnEvent && organizer && (
                <EventOrganizerProfile organizer={organizer} />
              )}

              {event.artists.length > 0 && (
                <section id="lineup" className="mt-12 scroll-mt-32">
                  <h2 className="text-xl font-semibold">Lineup</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {event.artists.map((artist) => (
                      <Link
                        key={artist.slug}
                        href={`/artists/${artist.slug}`}
                        className="focus-ring group flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-brand/40"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border">
                          <Image
                            src={getSafeArtistImageUrl(artist.image)}
                            alt={artist.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium group-hover:text-brand">
                            {artist.name}
                          </p>
                          <p className="truncate text-sm capitalize text-muted">
                            {artist.genre}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="order-1 lg:order-2 lg:col-span-1">
              <div id="tickets" className="scroll-mt-32 lg:sticky lg:top-24">
                {isOwnEvent ? (
                  <OrganizerEventManagePanel
                    eventSlug={event.slug}
                    eventTitle={event.title}
                  />
                ) : ended ? (
                  <div className="rounded-2xl border border-border bg-surface p-6">
                    <h2 className="text-lg font-semibold">This event has ended</h2>
                    <p className="mt-2 text-sm text-muted">
                      Tickets are no longer available for {event.title}. Explore
                      other upcoming shows happening near you.
                    </p>
                    <Link
                      href="/events"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                    >
                      Browse events
                    </Link>
                  </div>
                ) : (
                  <TicketTierSelector
                    eventSlug={event.slug}
                    tiers={event.tiers}
                    eventTitle={event.title}
                    organizerEmail={organizerEmailForTickets}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <div id="location" className="scroll-mt-32">
        <VenueMap venue={event.venue} />
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-surface p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </p>
        <div className="mt-1 text-sm font-medium">{value}</div>
        {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );
}
