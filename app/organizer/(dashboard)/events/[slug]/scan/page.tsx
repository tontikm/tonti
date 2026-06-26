import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DoorScanner } from "@/components/organizer/DoorScanner";
import { getEventBySlug } from "@/lib/data/events";
import { getEventTicketSummary, getEventTickets } from "@/lib/tickets";
import { requireOwnEvent } from "@/lib/organizer/require-auth";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? `Scan · ${event.title}` : "Door scanner",
  };
}

export default async function OrganizerEventScanPage({ params }: Props) {
  const { slug } = await params;
  const result = await requireOwnEvent(slug);
  if ("error" in result) {
    redirect("/organizer/events");
  }
  const { event } = result;

  const [summary, tickets] = await Promise.all([
    getEventTicketSummary(slug),
    getEventTickets(slug),
  ]);

  return (
    <div className="-mx-4 sm:mx-0">
      <div className="border-b border-border px-4 pb-4 sm:border-0 sm:px-0 sm:pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Door scanner
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
          {event.title}
        </h1>
      </div>

      <div className="px-4 pt-4 sm:px-0 sm:pt-0">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-12 text-center text-sm text-muted">
              Loading scanner…
            </div>
          }
        >
          <DoorScanner
            eventSlug={slug}
            eventTitle={event.title}
            summary={{
              totalTickets: summary.totalTickets,
              checkedIn: summary.checkedIn,
              valid: summary.valid,
            }}
            tickets={tickets}
          />
        </Suspense>
      </div>
    </div>
  );
}
