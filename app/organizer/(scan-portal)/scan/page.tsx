import Link from "next/link";
import { ScanLine } from "lucide-react";
import { getAssignedScannerEventsForSession } from "@/lib/organizer/door-staff";
import { formatDateRange, formatEventTime } from "@/lib/utils";

export const metadata = {
  title: "Door scanner",
};

export default async function ScannerHomePage() {
  const events = await getAssignedScannerEventsForSession();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">
          Choose an event to open the door scanner.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          No active scanner assignments. Ask the organizer to send you a new
          invite link.
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.slug}>
              <Link
                href={`/organizer/scan/${event.slug}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface/50 px-4 py-4 transition-colors hover:border-violet-500/40 hover:bg-violet-500/5"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{event.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {formatDateRange(event.date, event.endDate)} · Show{" "}
                    {formatEventTime(event.showTime)}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {event.venue.name}, {event.venue.city}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">
                  <ScanLine className="h-3.5 w-3.5" />
                  Open scanner
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
