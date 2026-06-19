import { notFound } from "next/navigation";
import { ScanLine, Users } from "lucide-react";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { TicketGuestList } from "@/components/organizer/TicketGuestList";
import { Button } from "@/components/ui/Button";
import { getEventBySlug } from "@/lib/data/events";
import { getEventTicketSummary, getEventTickets } from "@/lib/tickets";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { formatEventDate } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? `Tickets · ${event.title}` : "Event tickets",
  };
}

export default async function OrganizerEventTicketsPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const supabaseReady = isSupabaseAdminConfigured();
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
          <Button href={`/organizer/events/${slug}/scan`} size="md">
            <ScanLine className="h-4 w-4" />
            Door scanner
          </Button>
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
        <StatCard label="Checked in" value={summary.checkedIn} />
        <StatCard label="Pending" value={summary.valid} />
      </div>

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
        <h2 className="text-lg font-semibold">Guest list</h2>
        <div className="mt-4 max-w-3xl">
          <TicketGuestList eventSlug={slug} tickets={tickets} />
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
