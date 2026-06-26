import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DoorScanner } from "@/components/organizer/DoorScanner";
import { requireScanAccess } from "@/lib/organizer/require-auth";
import { getEventTicketSummary } from "@/lib/tickets";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const result = await requireScanAccess(slug);
  if ("error" in result) {
    return { title: "Door scanner" };
  }
  return { title: `Scan · ${result.event.title}` };
}

export default async function ScannerEventScanPage({ params }: Props) {
  const { slug } = await params;
  const result = await requireScanAccess(slug);
  if ("error" in result) {
    redirect("/organizer/scan");
  }

  const { event } = result;
  const summary = await getEventTicketSummary(slug);

  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Door scanner
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          {event.title}
        </h1>
      </div>

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
          accessMode="scanOnly"
        />
      </Suspense>
    </div>
  );
}
