import Link from "next/link";
import { EventPublicationActions } from "@/components/admin/EventPublicationActions";
import { EventPublicationBadge } from "@/components/admin/EventPublicationBadge";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { OrganizerStatusBadge } from "@/components/admin/OrganizerStatusBadge";
import { listAdminEvents } from "@/lib/admin/data";
import { isFeeIncomplete } from "@/lib/payments/order-revenue";
import { formatOrganizerFeePercentLabel } from "@/lib/payments/service-fee";
import { formatDateRange, formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin · Events",
  robots: { index: false, follow: false },
};

export default async function AdminEventsPage() {
  const events = await listAdminEvents();
  const feeLabel = formatOrganizerFeePercentLabel();

  return (
    <>
      <AdminPageHeader
        title="Events"
        description="Review new events before they go live, manage the homepage carousel, and monitor sales."
      />

      {events.length === 0 ? (
        <p className="text-sm text-muted">No events yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Review</th>
                  <th className="px-4 py-3 font-medium">Organizer</th>
                  <th className="px-4 py-3 font-medium">Tickets</th>
                  <th className="px-4 py-3 font-medium">Collected</th>
                  <th className="px-4 py-3 font-medium">Spotra ({feeLabel})</th>
                  <th className="px-4 py-3 font-medium">Organizer net</th>
                  <th className="px-4 py-3 font-medium">Public</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {events.map((event) => (
                  <tr key={event.slug} className="bg-surface/20">
                    <td className="px-4 py-4">
                      <p className="font-medium">{event.title}</p>
                      {isFeeIncomplete(
                        event.sales.ticketRevenue,
                        event.sales.platformFee,
                      ) && (
                        <Link
                          href={`/admin/events/${event.slug}`}
                          className="mt-1 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200 hover:bg-amber-500/30"
                        >
                          Fee incomplete
                        </Link>
                      )}
                      <Link
                        href={`/admin/events/${event.slug}/preview`}
                        className="text-xs text-amber-200 underline-offset-4 hover:underline"
                      >
                        Preview event
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <EventPublicationBadge status={event.publicationStatus} />
                      <div className="mt-2">
                        <EventPublicationActions
                          slug={event.slug}
                          status={event.publicationStatus}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p>{event.organizerName ?? "—"}</p>
                      {event.organizerStatus && (
                        <OrganizerStatusBadge
                          status={event.organizerStatus}
                          className="mt-1"
                        />
                      )}
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {event.sales.ticketCount}
                    </td>
                    <td className="px-4 py-4 font-mono text-sm">
                      {formatPrice(event.sales.grossRevenue)}
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-amber-200/90">
                      {formatPrice(event.sales.platformFee)}
                    </td>
                    <td className="px-4 py-4 font-mono text-sm">
                      {formatPrice(event.sales.organizerNet)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          event.isPubliclyVisible
                            ? "text-emerald-300"
                            : "text-amber-200"
                        }
                      >
                        {event.isPubliclyVisible ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {formatDateRange(event.date.slice(0, 10))}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/events/${event.slug}`}
                        className="text-xs text-amber-200 underline-offset-4 hover:underline"
                      >
                        Sales
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted">
            Confirmed orders only. Free and comp tickets appear in the sales
            detail but may not add revenue.
          </p>
        </>
      )}
    </>
  );
}
