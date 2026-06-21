import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ScanLine, Users, Tag } from "lucide-react";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { PlatformFeeNotice } from "@/components/organizer/PlatformFeeNotice";
import { TicketGuestList } from "@/components/organizer/TicketGuestList";
import { CompTicketForm } from "@/components/organizer/CompTicketForm";
import { ExportGuestListButton } from "@/components/organizer/ExportGuestListButton";
import { Button } from "@/components/ui/Button";
import { getEventBySlug } from "@/lib/data/events";
import { requireOwnEvent } from "@/lib/organizer/require-auth";
import { getEventTicketSummary, getEventTickets } from "@/lib/tickets";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { formatEventDate } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseStatusFilter(
  value: string | string[] | undefined,
): "all" | "checked-in" | "pending" {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "checked-in" || raw === "pending") return raw;
  return "all";
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? `Tickets · ${event.title}` : "Event tickets",
  };
}

export default async function OrganizerEventTicketsPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const statusFilter = parseStatusFilter(query.status);
  const result = await requireOwnEvent(slug);
  if ("error" in result) {
    redirect("/organizer/events");
  }
  const { event } = result;

  const supabaseReady = isSupabaseAdminConfigured();
  const hasPaidTiers = event.tiers.some((tier) => tier.price > 0);
  const [summary, tickets] = await Promise.all([
    getEventTicketSummary(slug),
    getEventTickets(slug),
  ]);

  return (
    <>
      <OrganizerPageHeader
        title={event.title}
        description={`${formatEventDate(event.date)} · Guest list & check-ins`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button href={`/organizer/events/${slug}/promos`} variant="secondary" size="md">
              <Tag className="h-4 w-4" />
              Promo codes
            </Button>
            <Button href={`/organizer/events/${slug}/scan`} size="md">
              <ScanLine className="h-4 w-4" />
              Door scanner
            </Button>
          </div>
        }
      />

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Ticket data requires Supabase. Add{" "}
          <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> and
          run migration <code className="text-foreground">0003_tickets.sql</code>.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total tickets" value={summary.totalTickets} />
        <StatCard
          label="Checked in"
          value={summary.checkedIn}
          href={
            summary.checkedIn > 0
              ? `/organizer/events/${slug}/tickets?status=checked-in`
              : undefined
          }
        />
        <StatCard label="Pending" value={summary.valid} />
      </div>

      {hasPaidTiers && (
        <PlatformFeeNotice variant="inline" className="mt-6" />
      )}

      <p className="mt-4 text-sm text-muted">
        <Users className="mr-1 inline h-4 w-4" />
        {summary.orderCount} order{summary.orderCount !== 1 ? "s" : ""}
      </p>

      {summary.byTier.length > 0 && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            By tier
          </h2>
          <ul className="mt-4 space-y-3">
            {summary.byTier.map((tier) => (
              <li
                key={tier.tierId}
                className="flex items-center justify-between text-sm"
              >
                <span>{tier.tierName}</span>
                <span className="text-muted">
                  {tier.checkedIn}/{tier.total} checked in
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Guest list</h2>
          <ExportGuestListButton eventTitle={event.title} tickets={tickets} />
        </div>
        <div className="mt-4 max-w-3xl">
          <Suspense fallback={<GuestListFallback />}>
            <TicketGuestList
              eventSlug={slug}
              tickets={tickets}
              initialStatusFilter={statusFilter}
            />
          </Suspense>
        </div>
      </div>

      <div className="mt-10 max-w-3xl">
        <CompTicketForm eventSlug={slug} tiers={event.tiers} />
      </div>
    </>
  );
}

function GuestListFallback() {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 px-4 py-10 text-center text-sm text-muted">
      Loading guest list…
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </>
  );

  const className = `rounded-2xl border border-white/10 bg-white/[0.02] p-5${
    href
      ? " block transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5"
      : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
