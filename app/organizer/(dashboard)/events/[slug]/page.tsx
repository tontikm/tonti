import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  ExternalLink,
  FileText,
  MapPin,
  Pencil,
  ScanLine,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { getEventSalesReport } from "@/lib/tickets";
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
  if ("error" in result) return { title: "Event" };
  return { title: `Manage · ${result.event.title}` };
}

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Upcoming",
  today: "Happening today",
  ended: "Ended",
};

const STATUS_CLASS: Record<string, string> = {
  upcoming: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  today: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  ended: "border-white/20 bg-white/5 text-muted",
};

export default async function OrganizerEventHubPage({ params }: Props) {
  const { slug } = await params;
  const result = await requireOwnEvent(slug);
  if ("error" in result) {
    redirect("/organizer/events");
  }

  const { event } = result;
  const status = getEventStatus(event);
  const ended = status === "ended";
  const supabaseReady = isSupabaseAdminConfigured();
  const report = await getEventSalesReport(slug, event.tiers);

  const totalCapacity = event.tiers.reduce(
    (sum, tier) => sum + tier.capacity,
    0,
  );
  const soldPct =
    totalCapacity > 0
      ? Math.min(100, Math.round((report.totalTickets / totalCapacity) * 100))
      : 0;
  const checkInPct = Math.round(report.checkInRate * 100);

  return (
    <>
      <OrganizerPageHeader
        title={event.title}
        description={`${formatDateRange(event.date, event.endDate)} · Show ${formatEventTime(event.showTime)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {STATUS_LABEL[status]}
            </span>
            <Link
              href={`/events/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View public page
            </Link>
          </div>
        }
      />

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Live sales and check-in data require Supabase. Add{" "}
          <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> to
          see real figures.
        </div>
      )}

      {ended && (
        <div className="mb-6 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-muted">
          This event has ended. Generate a final report and export your guest
          list for your records.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tickets sold"
          value={String(report.totalTickets)}
          sub={totalCapacity > 0 ? `${soldPct}% of ${totalCapacity}` : undefined}
          icon={Users}
        />
        <StatCard
          label="Revenue (gross)"
          value={formatPrice(report.grossRevenue)}
          sub={`Net ${formatPrice(report.organizerNet)} after fee`}
          icon={TrendingUp}
        />
        <StatCard
          label="Checked in"
          value={`${report.checkedIn}/${report.totalTickets || 0}`}
          sub={`${checkInPct}% check-in rate`}
          icon={ScanLine}
          href={
            report.checkedIn > 0
              ? `/organizer/events/${slug}/tickets?status=checked-in`
              : undefined
          }
        />
        <StatCard
          label="Orders"
          value={String(report.orderCount)}
          sub={report.compTickets > 0 ? `${report.compTickets} comp` : undefined}
          icon={Tag}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold">Sales by tier</h2>
          {report.byTier.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No tickets sold yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10">
              {report.byTier.map((tier) => (
                <li
                  key={tier.tierId}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{tier.tierName}</p>
                    <p className="mt-0.5 text-muted">
                      {tier.price === 0 ? "Free" : formatPrice(tier.price)} ·{" "}
                      {tier.sold}
                      {tier.capacity > 0 ? `/${tier.capacity}` : ""} sold
                      {tier.comp > 0 ? ` · ${tier.comp} comp` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium">
                      {formatPrice(tier.revenue)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {tier.checkedIn} in
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold">Manage</h2>
          <div className="mt-4 grid gap-2">
            <ManageLink
              href={`/organizer/events/${slug}/report`}
              icon={FileText}
              label="Event report"
            />
            <ManageLink
              href={`/organizer/events/${slug}/tickets`}
              icon={Users}
              label="Guest list & comps"
            />
            <ManageLink
              href={`/organizer/events/${slug}/scan`}
              icon={ScanLine}
              label="Door scanner"
            />
            <ManageLink
              href={`/organizer/events/${slug}/promos`}
              icon={Tag}
              label="Promo codes"
            />
            <ManageLink
              href={`/organizer/events/${slug}/edit`}
              icon={Pencil}
              label="Edit event"
            />
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4 text-sm">
            <p className="flex items-center gap-2 text-muted">
              <MapPin className="h-4 w-4 shrink-0" />
              {event.venue.name}, {event.venue.city}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </p>
        <Icon className="h-4 w-4 text-muted" />
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </>
  );

  const className = `rounded-2xl border border-white/10 bg-white/[0.02] p-5${
    href
      ? " transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5"
      : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={`block ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function ManageLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium transition-colors hover:border-violet-500/40 hover:bg-violet-500/5"
    >
      <Icon className="h-4 w-4 shrink-0 text-violet-400" />
      {label}
    </Link>
  );
}
