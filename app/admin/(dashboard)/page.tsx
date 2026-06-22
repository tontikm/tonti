import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { getPlatformDashboardStats } from "@/lib/admin/stats";
import { getOrganizerPayoutSummaries } from "@/lib/admin/payouts";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const [stats, payoutSummaries] = await Promise.all([
    getPlatformDashboardStats(),
    getOrganizerPayoutSummaries(),
  ]);

  const totalOwedToOrganizers = payoutSummaries
    .filter((row) => row.status === "approved")
    .reduce((sum, row) => sum + row.organizerOwed, 0);

  const cards = [
    {
      label: "Pending organizers",
      value: stats.pendingOrganizerCount,
      href: "/admin/organizers?status=pending",
      highlight: stats.pendingOrganizerCount > 0,
    },
    {
      label: "Approved organizers",
      value: stats.approvedOrganizerCount,
      href: "/admin/organizers?status=approved",
    },
    {
      label: "Events",
      value: stats.eventCount,
      href: "/admin/events",
    },
    {
      label: "Featured events",
      value: stats.featuredEventCount,
      href: "/admin/events",
    },
    {
      label: "Confirmed orders",
      value: stats.confirmedOrderCount,
      href: "/admin/orders",
    },
    {
      label: "Platform fees (all events)",
      value: formatPrice(stats.totalServiceFee),
      href: "/admin/orders",
    },
    {
      label: "Collected (all events)",
      value: formatPrice(stats.totalGrossRevenue),
      href: "/admin/orders",
    },
    {
      label: "Organizer share (all events)",
      value: formatPrice(stats.totalOrganizerNet),
      href: "/admin/orders",
    },
    {
      label: "Owed to organizers",
      value: formatPrice(totalOwedToOrganizers),
      href: "/admin/payouts",
    },
    {
      label: "Suspended organizers",
      value: stats.suspendedOrganizerCount,
      href: "/admin/organizers?status=suspended",
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Platform overview"
        description="Approve organizers, curate the homepage, and monitor ticket sales."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-2xl border p-5 transition-colors hover:bg-white/5 ${
              card.highlight
                ? "border-amber-500/40 bg-amber-950/20"
                : "border-white/10 bg-surface/40"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>

      {stats.pendingOrganizerCount > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 px-5 py-4">
          <p className="font-medium text-amber-100">
            {stats.pendingOrganizerCount} organizer
            {stats.pendingOrganizerCount === 1 ? "" : "s"} awaiting approval
          </p>
          <p className="mt-1 text-sm text-muted">
            Their events are hidden from the public site until you approve them.
          </p>
          <Link
            href="/admin/organizers?status=pending"
            className="mt-3 inline-block text-sm text-amber-200 underline-offset-4 hover:underline"
          >
            Review pending organizers →
          </Link>
        </div>
      )}
    </>
  );
}
