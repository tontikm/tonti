import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ExternalLink, MapPin } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { OrganizerPhotoStrip } from "@/components/organizer/OrganizerPhotoStrip";
import { getEventsByOrganizerId } from "@/lib/data/events";
import { getSafeOrganizerLogoUrl } from "@/lib/images";
import { getOrganizerBySlug } from "@/lib/organizer/profile";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const organizer = await getOrganizerBySlug(slug);
  if (!organizer) return { title: "Organizer not found" };
  return {
    title: organizer.name ?? "Organizer",
    description: organizer.bio?.slice(0, 160) ?? `Events by ${organizer.name}`,
  };
}

export default async function PublicOrganizerPage({ params }: Props) {
  const { slug } = await params;
  const organizer = await getOrganizerBySlug(slug);
  if (!organizer) notFound();

  const allEvents = await getEventsByOrganizerId(organizer.id);
  const now = new Date();
  const events = allEvents
    .filter((event) => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = allEvents
    .filter((event) => new Date(event.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const cities = [...new Set(events.map((event) => event.venue.city))];
  const logoUrl = organizer.logo
    ? getSafeOrganizerLogoUrl(organizer.logo)
    : null;

  return (
    <>
      <OrganizerPhotoStrip
        events={allEvents.map((event) => ({
          title: event.title,
          image: event.image,
        }))}
      />

      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {logoUrl ? (
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-black">
                <Image
                  src={logoUrl}
                  alt={organizer.name ?? "Organizer"}
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface text-3xl font-bold text-muted">
                {(organizer.name ?? "O").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold sm:text-4xl">
                {organizer.name ?? "Organizer"}
              </h1>
              {organizer.bio && (
                <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                  {organizer.bio}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {events.length} upcoming
                </span>
                {cities.length > 0 && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {cities.join(" · ")}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {organizer.websiteUrl && (
                  <a
                    href={organizer.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:border-foreground/30"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </a>
                )}
                {organizer.instagramUrl && (
                  <a
                    href={organizer.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:border-foreground/30"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Upcoming events</h2>
        <p className="mt-2 text-muted">
          {events.length} upcoming show{events.length !== 1 ? "s" : ""}
        </p>

        {events.length === 0 ? (
          <p className="mt-8 text-muted">No upcoming events from this organizer.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        )}

        {pastEvents.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold">Recent shows</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Link href="/events" className="text-sm text-accent hover:underline">
            ← Browse all events
          </Link>
        </div>
      </div>
    </>
  );
}
