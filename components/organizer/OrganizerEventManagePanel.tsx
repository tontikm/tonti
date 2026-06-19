import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  Pencil,
  ScanLine,
  Settings2,
  Ticket,
  Users,
} from "lucide-react";

type OrganizerEventManagePanelProps = {
  eventSlug: string;
  eventTitle: string;
};

const linkClass =
  "flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium transition-colors hover:border-violet-500/40 hover:bg-violet-500/5";

export function OrganizerEventManagePanel({
  eventSlug,
  eventTitle,
}: OrganizerEventManagePanelProps) {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-surface p-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-violet-400" />
        <h2 className="text-lg font-semibold">Manage this event</h2>
      </div>
      <p className="mt-2 text-sm text-muted">
        You&apos;re viewing <span className="text-foreground">{eventTitle}</span>{" "}
        as fans see it. Use the dashboard tools below instead of buying tickets.
      </p>

      <nav className="mt-6 space-y-2">
        <Link href={`/organizer/events/${eventSlug}/edit`} className={linkClass}>
          <Pencil className="h-4 w-4 shrink-0 text-violet-400" />
          Edit event
        </Link>
        <Link
          href={`/organizer/events/${eventSlug}/tickets`}
          className={linkClass}
        >
          <Users className="h-4 w-4 shrink-0 text-violet-400" />
          Guest list
        </Link>
        <Link href={`/organizer/events/${eventSlug}/scan`} className={linkClass}>
          <ScanLine className="h-4 w-4 shrink-0 text-violet-400" />
          Door scanner
        </Link>
        <Link href="/organizer/events" className={linkClass}>
          <Ticket className="h-4 w-4 shrink-0 text-violet-400" />
          All events
        </Link>
        <Link href="/organizer" className={linkClass}>
          <LayoutDashboard className="h-4 w-4 shrink-0 text-violet-400" />
          Dashboard
        </Link>
      </nav>

      <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
        <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
        Ticket sales appear on the public page for fans — not for organizer
        accounts.
      </p>
    </div>
  );
}
