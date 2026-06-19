import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
} from "lucide-react";
import { VenueMap } from "@/components/events/VenueMap";
import { TicketTierSelector } from "@/components/events/TicketTierSelector";
import { OrganizerEventManagePanel } from "@/components/organizer/OrganizerEventManagePanel";
import { EventCard } from "@/components/events/EventCard";
import { ShareButtons } from "@/components/events/ShareButtons";
import { Badge } from "@/components/ui/Badge";
import { getEventBySlug, getAllEvents } from "@/lib/data/events";
import { getOrganizerByEmail, getOrganizerById } from "@/lib/organizer/profile";
import { isOwnOrganizerEvent } from "@/lib/organizer/ownership";
import { getOrganizerSession } from "@/lib/organizer/session";
import { getCategoryColor, getCategoryLabel } from "@/lib/data/categories";
import { getSafeEventImageUrl } from "@/lib/images";
import { getFanUser } from "@/lib/auth/session";
import {
  formatDateRange,
  formatEventDate,
  formatEventTime,
} from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await getAllEvents()).map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const related = (await getAllEvents())
    .filter(
      (e) =>
        e.slug !== event.slug &&
        (e.category === event.category || e.venue.city === event.venue.city),
    )
    .slice(0, 3);

  const organizerSession = await getOrganizerSession();
  const fanUser = await getFanUser();
  const organizerProfile = organizerSession
    ? await getOrganizerByEmail(organizerSession.email)
    : null;
  const isOwnEvent = isOwnOrganizerEvent(
    event,
    organizerSession,
    organizerProfile?.name,
  );
  const organizerEmailForTickets =
    organizerSession && !fanUser && !isOwnEvent
      ? organizerSession.email
      : null;

  const organizer = event.organizerId
    ? await getOrganizerById(event.organizerId)
    : null;

  return (
    <>
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

            <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Badge color={getCategoryColor(event.category)}>
                  {getCategoryLabel(event.category)}
                </Badge>
                {event.ageLimit != null && (
                  <Badge className="border border-border bg-surface text-muted">
                    {event.ageLimit >= 18
                      ? `${event.ageLimit}+ · Adults only`
                      : `${event.ageLimit}+ only`}
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

              <div className="mt-10">
                <h2 className="text-xl font-semibold">About this show</h2>
                <p className="mt-3 leading-relaxed text-muted">
                  {event.description}
                </p>
                {event.ageLimit != null && event.ageLimit >= 18 && (
                  <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                    This is an adult event. Valid ID proving you are{" "}
                    {event.ageLimit}+ may be required at the door.
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

                {event.refundPolicy && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold">Refund policy</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                      {event.refundPolicy}
                    </p>
                  </div>
                )}

                {organizer?.slug && organizer.name && (
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
                <ShareButtons title={event.title} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {isOwnEvent ? (
                  <OrganizerEventManagePanel
                    eventSlug={event.slug}
                    eventTitle={event.title}
                  />
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

      <VenueMap venue={event.venue} />

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">You might also like</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </section>
      )}
    </>
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
