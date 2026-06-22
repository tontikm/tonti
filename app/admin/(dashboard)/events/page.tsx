import Link from "next/link";
import { AdminFeaturedToggle } from "@/components/admin/AdminFeaturedToggle";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { OrganizerStatusBadge } from "@/components/admin/OrganizerStatusBadge";
import { listAdminEvents } from "@/lib/admin/data";
import { formatDateRange, formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin · Events",
  robots: { index: false, follow: false },
};

export default async function AdminEventsPage() {
  const events = await listAdminEvents();

  return (
    <>
      <AdminPageHeader
        title="Events"
        description="Feature events on the homepage and review ticket sales per event."
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
                  <th className="px-4 py-3 font-medium">Organizer</th>
                  <th className="px-4 py-3 font-medium">Tickets</th>
                  <th className="px-4 py-3 font-medium">Gross</th>
                  <th className="px-4 py-3 font-medium">Tonti (3%)</th>
                  <th className="px-4 py-3 font-medium">Organizer</th>
                  <th className="px-4 py-3 font-medium">Public</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {events.map((event) => (
                  <tr key={event.slug} className="bg-surface/20">
                    <td className="px-4 py-4">
                      <p className="font-medium">{event.title}</p>
                      {event.isPubliclyVisible ? (
                        <Link
                          href={`/events/${event.slug}`}
                          className="text-xs text-muted underline-offset-4 hover:underline"
                        >
                          View public page
                        </Link>
                      ) : (
                        <p className="text-xs text-amber-200/80">
                          Hidden from public
                        </p>
                      )}
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
                    <td className="px-4 py-4">
                      <AdminFeaturedToggle
                        slug={event.slug}
                        featured={event.featured}
                      />
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
