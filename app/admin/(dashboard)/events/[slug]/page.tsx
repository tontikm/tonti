import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { AdminReportStat } from "@/components/admin/AdminReportStat";
import { listAdminOrders } from "@/lib/admin/data";
import { getEventBySlug } from "@/lib/data/events";
import { organizerNetFromOrder } from "@/lib/payments/order-revenue";
import { getEventSalesReport } from "@/lib/tickets";
import {
  formatDateRange,
  formatEventTime,
  formatPrice,
  getEventStatus,
} from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? `Admin sales · ${event.title}` : "Event sales",
    robots: { index: false, follow: false },
  };
}

export default async function AdminEventSalesPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const [report, orders] = await Promise.all([
    getEventSalesReport(slug, event.tiers),
    listAdminOrders(50, slug),
  ]);

  const status = getEventStatus(event);
  const checkInPct = Math.round(report.checkInRate * 100);

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
        title={`${event.title} · sales`}
        description={`${formatDateRange(event.date, event.endDate)} · Show ${formatEventTime(event.showTime)} · ${status === "ended" ? "Final" : "Live"}${event.organizerName ? ` · ${event.organizerName}` : ""}`}
        action={
          <Link
            href={`/admin/orders?event=${slug}`}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            All orders
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminReportStat
          label="Collected revenue"
          value={formatPrice(report.grossRevenue)}
          sub="Paid by fans (confirmed orders, after promos)"
        />
        <AdminReportStat
          label="Tonti platform fee (3%)"
          value={formatPrice(report.serviceFee)}
          sub="Your share"
        />
        <AdminReportStat
          label="Organizer net"
          value={formatPrice(report.organizerNet)}
          sub="Owed to organizer"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminReportStat
          label="Tickets sold"
          value={String(report.totalTickets)}
          sub={
            report.compTickets > 0
              ? `${report.compTickets} comp`
              : undefined
          }
        />
        <AdminReportStat label="Orders" value={String(report.orderCount)} />
        <AdminReportStat
          label="Checked in"
          value={`${report.checkedIn}/${report.totalTickets || 0}`}
          sub={`${checkInPct}% check-in rate`}
        />
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold">By ticket tier</h2>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
              <th className="px-4 py-3 text-right font-medium">Sold</th>
              <th className="px-4 py-3 text-right font-medium">Comp</th>
              <th className="px-4 py-3 text-right font-medium">Checked in</th>
              <th className="px-4 py-3 text-right font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {report.byTier.map((tier) => (
              <tr key={tier.tierId}>
                <td className="px-4 py-3 font-medium">{tier.tierName}</td>
                <td className="px-4 py-3 text-right text-muted">
                  {tier.price === 0 ? "Free" : formatPrice(tier.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  {tier.sold}
                  {tier.capacity > 0 ? (
                    <span className="text-muted">/{tier.capacity}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right text-muted">{tier.comp}</td>
                <td className="px-4 py-3 text-right text-muted">
                  {tier.checkedIn}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatPrice(tier.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-white/10 bg-white/[0.03] font-medium">
            <tr>
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3" />
              <td className="px-4 py-3 text-right">{report.totalTickets}</td>
              <td className="px-4 py-3 text-right">{report.compTickets}</td>
              <td className="px-4 py-3 text-right">{report.checkedIn}</td>
              <td className="px-4 py-3 text-right font-mono">
                {formatPrice(report.grossRevenue)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold">Recent orders</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-muted">No orders for this event yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Tickets</th>
                <th className="px-4 py-3 font-medium">Gross</th>
                <th className="px-4 py-3 font-medium">Tonti fee</th>
                <th className="px-4 py-3 font-medium">Organizer net</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => {
                const isConfirmed = order.status === "confirmed";
                const gross = order.totalAmount || order.subtotalAmount;
                const organizerNet = organizerNetFromOrder({
                  subtotalAmount: order.subtotalAmount,
                  totalAmount: order.totalAmount,
                  serviceFee: order.serviceFee,
                });
                const feeMissing =
                  isConfirmed &&
                  order.totalAmount > 0 &&
                  order.serviceFee === 0;
                return (
                  <tr
                    key={order.id}
                    className={feeMissing ? "bg-amber-950/20" : "bg-surface/20"}
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium">{order.buyerName}</p>
                      <p className="text-xs text-muted">{order.buyerEmail}</p>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {order.ticketCount}
                    </td>
                    <td className="px-4 py-4 font-mono">
                      {isConfirmed ? formatPrice(gross) : "—"}
                    </td>
                    <td className="px-4 py-4 font-mono text-amber-200/90">
                      {isConfirmed ? (
                        feeMissing ? (
                          <span title="Legacy order. Run migration 0022 or check fee">
                            {formatPrice(order.serviceFee)} ⚠
                          </span>
                        ) : (
                          formatPrice(order.serviceFee)
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono">
                      {isConfirmed ? formatPrice(organizerNet) : "—"}
                    </td>
                    <td className="px-4 py-4 capitalize">{order.status}</td>
                    <td className="px-4 py-4 text-xs text-muted">
                      {order.paymentProvider ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {new Date(order.createdAt).toLocaleString("en-ZA", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Africa/Johannesburg",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted">
        Summary totals use confirmed orders only. Pending or failed orders
        appear in the list but do not affect revenue figures. Payouts to
        organizers are handled outside Tonti (e.g. EFT after the event).
      </p>
    </>
  );
}
