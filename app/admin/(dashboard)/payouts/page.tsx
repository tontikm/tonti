import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ExportPayoutsCsvButton } from "@/components/admin/ExportPayoutsCsvButton";
import { OrganizerStatusBadge } from "@/components/admin/OrganizerStatusBadge";
import { getOrganizerPayoutSummaries } from "@/lib/admin/payouts";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin · Payouts",
  robots: { index: false, follow: false },
};

export default async function AdminPayoutsPage() {
  const summaries = await getOrganizerPayoutSummaries();
  const withSales = summaries.filter((row) => row.orderCount > 0);
  const totalOwed = withSales.reduce((sum, row) => sum + row.organizerOwed, 0);
  const totalOutstanding = withSales.reduce(
    (sum, row) => sum + row.outstanding,
    0,
  );
  const totalPaid = withSales.reduce((sum, row) => sum + row.paidOut, 0);

  return (
    <>
      <AdminPageHeader
        title="Organizer payouts"
        description="Settle with organizers via EFT. Export a CSV for your bank batch."
        action={<ExportPayoutsCsvButton summaries={summaries} />}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-surface/40 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Total owed (gross)
          </p>
          <p className="mt-2 text-2xl font-bold">{formatPrice(totalOwed)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface/40 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Paid out
          </p>
          <p className="mt-2 text-2xl font-bold">{formatPrice(totalPaid)}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Outstanding
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-100">
            {formatPrice(totalOutstanding)}
          </p>
        </div>
      </div>

      {withSales.length === 0 ? (
        <p className="text-sm text-muted">No confirmed sales yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Organizer</th>
                <th className="px-4 py-3 font-medium">Events</th>
                <th className="px-4 py-3 font-medium">Collected</th>
                <th className="px-4 py-3 font-medium">Spotra (3%)</th>
                <th className="px-4 py-3 font-medium">Owed</th>
                <th className="px-4 py-3 font-medium">Paid</th>
                <th className="px-4 py-3 font-medium">Outstanding</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {withSales.map((row) => (
                <tr key={row.id} className="bg-surface/20">
                  <td className="px-4 py-4">
                    <p className="font-medium">{row.name ?? "—"}</p>
                    <p className="text-xs text-muted">{row.email}</p>
                    <OrganizerStatusBadge status={row.status} className="mt-1" />
                  </td>
                  <td className="px-4 py-4 text-muted">{row.eventCount}</td>
                  <td className="px-4 py-4 font-mono">
                    {formatPrice(row.collected)}
                  </td>
                  <td className="px-4 py-4 font-mono text-amber-200/90">
                    {formatPrice(row.platformFee)}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    {formatPrice(row.organizerOwed)}
                  </td>
                  <td className="px-4 py-4 font-mono text-muted">
                    {formatPrice(row.paidOut)}
                  </td>
                  <td className="px-4 py-4 font-mono font-medium text-amber-100">
                    {formatPrice(row.outstanding)}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/organizers/${row.id}`}
                      className="text-xs text-amber-200 underline-offset-4 hover:underline"
                    >
                      Statement
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted">
        Confirmed orders only. CSV export includes organizers with an
        outstanding balance. Record payouts after EFT to keep balances current.
      </p>
    </>
  );
}
