import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { EventPublicationActions } from "@/components/admin/EventPublicationActions";
import { EventPublicationBadge } from "@/components/admin/EventPublicationBadge";
import { OrganizerStatusBadge } from "@/components/admin/OrganizerStatusBadge";
import {
  getApprovedOrganizerIds,
  isEventPubliclyVisible,
  listAdminEvents,
} from "@/lib/admin/data";
import { getEventBySlug } from "@/lib/data/events";
import { getSafeEventImageUrl } from "@/lib/images";
import {
  formatDateRange,
  formatEventDate,
  formatEventTime,
  formatPrice,
} from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export const metadata = {
  title: "Admin · Event preview",
  robots: { index: false, follow: false },
};

export default async function AdminEventPreviewPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const adminEvent = (await listAdminEvents()).find((row) => row.slug === slug);
  const publicationStatus =
    adminEvent?.publicationStatus ?? event.publicationStatus ?? "approved";
  const approvedIds = await getApprovedOrganizerIds();
  const isPubliclyVisible = isEventPubliclyVisible(
    { organizerId: event.organizerId, publicationStatus },
    approvedIds,
  );

  return (
    <>
      <Link
        href="/admin/events"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <AdminPageHeader
        title={event.title}
        description="Review this event before approving it for the public site."
        action={
          isPubliclyVisible ? (
            <Link
              href={`/events/${slug}`}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              View live page
            </Link>
          ) : null
        }
      />

      <div className="mb-8 rounded-2xl border border-white/10 bg-surface/40 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <EventPublicationBadge status={publicationStatus} />
            {adminEvent?.organizerStatus && (
              <OrganizerStatusBadge status={adminEvent.organizerStatus} />
            )}
            {!isPubliclyVisible && (
              <span className="text-sm text-muted">
                Hidden from fans until organizer and event are approved.
              </span>
            )}
          </div>
          <EventPublicationActions slug={slug} status={publicationStatus} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="relative aspect-[21/9] min-h-[220px] w-full bg-black">
          <Image
            src={getSafeEventImageUrl(event.image)}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <div>
            <h2 className="text-3xl font-bold">{event.title}</h2>
            {event.subtitle && (
              <p className="mt-2 text-lg text-muted">{event.subtitle}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PreviewFact
              icon={Calendar}
              label="Date"
              value={
                event.endDate
                  ? formatDateRange(event.date, event.endDate)
                  : formatEventDate(event.date)
              }
            />
            <PreviewFact
              icon={Clock}
              label="Show time"
              value={`Doors ${formatEventTime(event.doorsTime)} · Show ${formatEventTime(event.showTime)}`}
            />
            <PreviewFact
              icon={MapPin}
              label="Venue"
              value={event.venue.name}
              sub={`${event.venue.address}, ${event.venue.city}`}
            />
            <PreviewFact
              label="Organizer"
              value={event.organizerName ?? "—"}
              sub={adminEvent?.organizerStatus ?? undefined}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">About</h3>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-muted">
              {event.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Ticket tiers</h3>
            {event.tiers.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No ticket tiers yet.</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tier</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {event.tiers.map((tier) => (
                      <tr key={tier.id}>
                        <td className="px-4 py-3 font-medium">{tier.name}</td>
                        <td className="px-4 py-3">
                          {tier.price === 0 ? "Free" : formatPrice(tier.price)}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {tier.capacity > 0 ? tier.capacity : "Unlimited"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function PreviewFact({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface/30 p-4">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </p>
      <p className="mt-2 font-medium">{value}</p>
      {sub && <p className="mt-1 text-sm capitalize text-muted">{sub}</p>}
    </div>
  );
}
