import Link from "next/link";
import {
  FileText,
  LayoutDashboard,
  Pencil,
  ScanLine,
  Settings2,
  Tag,
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
        You own <span className="text-foreground">{eventTitle}</span>. Open the
        management hub for live sales, check-ins, and reports.
      </p>

      <Link
        href={`/organizer/events/${eventSlug}`}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
      >
        <LayoutDashboard className="h-4 w-4 shrink-0" />
        Open management hub
      </Link>

      <nav className="mt-4 space-y-2">
        <Link
          href={`/organizer/events/${eventSlug}/report`}
          className={linkClass}
        >
          <FileText className="h-4 w-4 shrink-0 text-violet-400" />
          Event report
        </Link>
        <Link
          href={`/organizer/events/${eventSlug}/tickets`}
          className={linkClass}
        >
          <Users className="h-4 w-4 shrink-0 text-violet-400" />
          Guest list
        </Link>
        <Link
          href={`/organizer/events/${eventSlug}/promos`}
          className={linkClass}
        >
          <Tag className="h-4 w-4 shrink-0 text-violet-400" />
          Promo codes
        </Link>
        <Link href={`/organizer/events/${eventSlug}/scan`} className={linkClass}>
          <ScanLine className="h-4 w-4 shrink-0 text-violet-400" />
          Door scanner
        </Link>
        <Link href={`/organizer/events/${eventSlug}/edit`} className={linkClass}>
          <Pencil className="h-4 w-4 shrink-0 text-violet-400" />
          Edit event
        </Link>
      </nav>

      <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
        This is the public page as fans see it. Fans buy tickets here; use the
        hub above to manage and track your event.
      </p>
    </div>
  );
}
