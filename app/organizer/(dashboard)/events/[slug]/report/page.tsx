import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { ExportGuestListButton } from "@/components/organizer/ExportGuestListButton";
import { PrintReportButton } from "@/components/organizer/PrintReportButton";
import { getEventSalesReport, getEventTickets } from "@/lib/tickets";
import { requireOwnEvent } from "@/lib/organizer/require-auth";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
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
  const result = await requireOwnEvent(slug);
  if ("error" in result) return { title: "Event report" };
  return { title: `Report · ${result.event.title}` };
}

export default async function OrganizerEventReportPage({ params }: Props) {
  const { slug } = await params;
  const result = await requireOwnEvent(slug);
  if ("error" in result) {
    redirect("/organizer/events");
  }

  const { event } = result;
  const supabaseReady = isSupabaseAdminConfigured();
  const [report, tickets] = await Promise.all([
    getEventSalesReport(slug, event.tiers),
    getEventTickets(slug),
  ]);
  const status = getEventStatus(event);
  const checkInPct = Math.round(report.checkInRate * 100);

  return (
    <>
      <div className="print:hidden">
        <Link
          href={`/organizer/events/${slug}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to event hub
        </Link>
        <OrganizerPageHeader
          title={`${event.title} · report`}
          description={`${formatDateRange(event.date, event.endDate)} · Show ${formatEventTime(event.showTime)} · ${status === "ended" ? "Final" : "Live"}`}
          action={
            <div className="flex flex-wrap gap-2">
              <ExportGuestListButton
                eventTitle={event.title}
                tickets={tickets}
              />
              <PrintReportButton />
            </div>
          }
        />
      </div>

      <div className="hidden print:mb-6 print:block">
        <h1 className="text-2xl font-bold">{event.title} · event report</h1>
        <p className="mt-1 text-sm text-muted">
          {formatDateRange(event.date, event.endDate)} · Show{" "}
          {formatEventTime(event.showTime)}
        </p>
      </div>

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted print:hidden">
          Report figures require Supabase. Connect it to see real sales and
          check-in data.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStat label="Gross revenue" value={formatPrice(report.grossRevenue)} />
        <ReportStat label="Platform fee (3%)" value={formatPrice(report.serviceFee)} />
        <ReportStat label="Organizer net" value={formatPrice(report.organizerNet)} />
        <ReportStat
          label="Tickets sold"
          value={String(report.totalTickets)}
          sub={report.compTickets > 0 ? `${report.compTickets} comp` : undefined}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStat label="Orders" value={String(report.orderCount)} />
        <ReportStat
          label="Checked in"
          value={`${report.checkedIn}/${report.totalTickets || 0}`}
          sub={`${checkInPct}% check-in rate`}
        />
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
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

      {report.totalTickets === 0 && (
        <p className="mt-6 text-sm text-muted">
          No tickets have been issued for this event yet.
        </p>
      )}
    </>
  );
}

function ReportStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}
