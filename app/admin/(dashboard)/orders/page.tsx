import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { listAdminOrders } from "@/lib/admin/data";
import { getEventBySlug } from "@/lib/data/events";
import { organizerNetFromOrder } from "@/lib/payments/order-revenue";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin · Orders",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ event?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { event: eventSlug } = await searchParams;
  const orders = await listAdminOrders(100, eventSlug);
  const event = eventSlug ? await getEventBySlug(eventSlug) : null;

  return (
    <>
      <AdminPageHeader
        title={event ? `Orders · ${event.title}` : "Orders"}
        description={
          event
            ? `Ticket orders for this event.`
            : "Recent ticket orders across all events."
        }
        action={
          eventSlug ? (
            <Link
              href="/admin/orders"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              All events
            </Link>
          ) : undefined
        }
      />

      {orders.length === 0 ? (
        <p className="text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Buyer</th>
                {!eventSlug && (
                  <th className="px-4 py-3 font-medium">Event</th>
                )}
                <th className="px-4 py-3 font-medium">Tickets</th>
                <th className="px-4 py-3 font-medium">Gross</th>
                <th className="px-4 py-3 font-medium">Spotra fee</th>
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
                  bookingFee: order.bookingFee,
                });
                return (
                  <tr key={order.id} className="bg-surface/20">
                    <td className="px-4 py-4">
                      <p className="font-medium">{order.buyerName}</p>
                      <p className="text-xs text-muted">{order.buyerEmail}</p>
                    </td>
                    {!eventSlug && (
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/events/${order.eventSlug}`}
                          className="text-muted underline-offset-4 hover:text-foreground hover:underline"
                        >
                          {order.eventSlug}
                        </Link>
                      </td>
                    )}
                    <td className="px-4 py-4 text-muted">
                      {order.ticketCount}
                    </td>
                    <td className="px-4 py-4 font-mono">
                      {isConfirmed ? formatPrice(gross) : "—"}
                    </td>
                    <td className="px-4 py-4 font-mono text-amber-200/90">
                      {isConfirmed ? formatPrice(order.serviceFee) : "—"}
                    </td>
                    <td className="px-4 py-4 font-mono">
                      {isConfirmed ? formatPrice(organizerNet) : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="capitalize">{order.status}</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-muted">
                      {order.paymentProvider ?? "—"}
                      {order.paymentReference && (
                        <p className="mt-0.5 max-w-[8rem] truncate">
                          {order.paymentReference}
                        </p>
                      )}
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
    </>
  );
}
