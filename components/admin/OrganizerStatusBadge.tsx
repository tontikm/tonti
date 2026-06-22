import type { OrganizerStatus } from "@/lib/admin/data";
import { cn } from "@/lib/utils";

const STYLES: Record<OrganizerStatus, string> = {
  pending: "border-amber-500/30 bg-amber-950/30 text-amber-200",
  approved: "border-emerald-500/30 bg-emerald-950/30 text-emerald-200",
  suspended: "border-red-500/30 bg-red-950/30 text-red-200",
};

const LABELS: Record<OrganizerStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  suspended: "Suspended",
};

export function OrganizerStatusBadge({
  status,
  className,
}: {
  status: OrganizerStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
