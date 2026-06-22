import { AdminPageHeader } from "@/components/admin/AdminShell";
import { listAdminOrders } from "@/lib/admin/data";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin · Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders(100);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Recent ticket orders across all events."
      />

      {orders.length === 0 ? (
        <p className="text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Tickets</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Fee</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => (
                <tr key={order.id} className="bg-surface/20">
                  <td className="px-4 py-4">
                    <p className="font-medium">{order.buyerName}</p>
                    <p className="text-xs text-muted">{order.buyerEmail}</p>
                  </td>
                  <td className="px-4 py-4 text-muted">{order.eventSlug}</td>
                  <td className="px-4 py-4 text-muted">{order.ticketCount}</td>
                  <td className="px-4 py-4">
                    {formatPrice(order.subtotalAmount || order.totalAmount)}
                  </td>
                  <td className="px-4 py-4 text-muted">
                    {formatPrice(order.serviceFee)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="capitalize">{order.status}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-muted">
                    {order.paymentProvider ?? "—"}
                    {order.paymentReference && (
                      <p className="mt-0.5 truncate max-w-[8rem]">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
