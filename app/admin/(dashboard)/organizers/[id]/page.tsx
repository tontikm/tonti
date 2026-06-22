import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { AdminReportStat } from "@/components/admin/AdminReportStat";
import { OrganizerStatusBadge } from "@/components/admin/OrganizerStatusBadge";
import { PrintReportButton } from "@/components/organizer/PrintReportButton";
import { RecordPayoutForm } from "@/components/admin/RecordPayoutForm";
import { getOrganizerPayoutDetail } from "@/lib/admin/payouts";
import { formatDateRange, formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { summary } = await getOrganizerPayoutDetail(id);
  return {
    title: summary
      ? `Admin · ${summary.name ?? summary.email}`
      : "Organizer statement",
    robots: { index: false, follow: false },
  };
}

function formatAddress(summary: NonNullable<Awaited<ReturnType<typeof getOrganizerPayoutDetail>>["summary"]>) {
  const parts = [
    summary.invoiceAddressLine1,
    summary.invoiceAddressLine2,
    [summary.invoiceCity, summary.invoiceProvince, summary.invoicePostalCode]
      .filter(Boolean)
      .join(" "),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

export default async function AdminOrganizerDetailPage({ params }: Props) {
  const { id } = await params;
  const { summary, events, payouts } = await getOrganizerPayoutDetail(id);

  if (!summary) notFound();

  const address = formatAddress(summary);

  return (
    <>
      <div className="print:hidden">
        <Link
          href="/admin/payouts"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to payouts
        </Link>

        <AdminPageHeader
          title={summary.name ?? summary.email}
          description="Organizer statement and payout history."
          action={<PrintReportButton />}
        />
      </div>

      <div className="hidden print:mb-6 print:block">
        <h1 className="text-2xl font-bold">
          Tonti organizer statement
        </h1>
        <p className="mt-1 text-lg font-medium">{summary.name ?? summary.email}</p>
        <p className="text-sm text-muted">
          Generated {new Date().toLocaleDateString("en-ZA", { timeZone: "Africa/Johannesburg" })}
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
        <AdminReportStat
          label="Collected"
          value={formatPrice(summary.collected)}
          sub="Confirmed orders"
        />
        <AdminReportStat
          label="Tonti fee (3%)"
          value={formatPrice(summary.platformFee)}
        />
        <AdminReportStat
          label="Organizer owed"
          value={formatPrice(summary.organizerOwed)}
        />
        <AdminReportStat
          label="Outstanding"
          value={formatPrice(summary.outstanding)}
          sub={
            summary.paidOut > 0
              ? `${formatPrice(summary.paidOut)} paid out`
              : undefined
          }
        />
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-surface/40 p-5 print:border-black/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Contact & invoice</h2>
            <p className="mt-2 text-sm">{summary.email}</p>
            {summary.invoiceCompanyName && (
              <p className="text-sm text-muted">{summary.invoiceCompanyName}</p>
            )}
            {address && <p className="text-sm text-muted">{address}</p>}
            {summary.vatNumber && (
              <p className="text-sm text-muted">VAT: {summary.vatNumber}</p>
            )}
          </div>
          <OrganizerStatusBadge status={summary.status} />
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Events</h2>
      {events.length === 0 ? (
        <p className="text-sm text-muted">No events yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Tickets</th>
                <th className="px-4 py-3 font-medium">Collected</th>
                <th className="px-4 py-3 font-medium">Tonti (3%)</th>
                <th className="px-4 py-3 font-medium">Owed</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {events.map((event) => (
                <tr key={event.slug} className="bg-surface/20">
                  <td className="px-4 py-4">
                    <p className="font-medium">{event.title}</p>
                    {event.feeIncomplete && (
                      <span className="mt-1 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200">
                        Fee incomplete
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-muted">{event.ticketCount}</td>
                  <td className="px-4 py-4 font-mono">
                    {formatPrice(event.collected)}
                  </td>
                  <td className="px-4 py-4 font-mono text-amber-200/90">
                    {formatPrice(event.platformFee)}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    {formatPrice(event.organizerOwed)}
                  </td>
                  <td className="px-4 py-4 print:hidden">
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
            <tfoot className="border-t border-white/10 bg-white/[0.03] font-medium">
              <tr>
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 font-mono">
                  {formatPrice(summary.collected)}
                </td>
                <td className="px-4 py-3 font-mono text-amber-200/90">
                  {formatPrice(summary.platformFee)}
                </td>
                <td className="px-4 py-3 font-mono">
                  {formatPrice(summary.organizerOwed)}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2 print:mt-8 print:block">
        <div className="print:hidden">
          <RecordPayoutForm
            organizerId={summary.id}
            outstanding={summary.outstanding}
          />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Payout history</h2>
          {payouts.length === 0 ? (
            <p className="text-sm text-muted">No payouts recorded yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="bg-surface/20">
                      <td className="px-4 py-4 text-muted">
                        {new Date(payout.paidAt).toLocaleDateString("en-ZA", {
                          timeZone: "Africa/Johannesburg",
                        })}
                      </td>
                      <td className="px-4 py-4 font-mono">
                        {formatPrice(payout.amount)}
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {payout.reference ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {payout.notes ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
