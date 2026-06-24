import type { EventPublicationStatus } from "@/lib/admin/data";
import { cn } from "@/lib/utils";

const STYLES: Record<EventPublicationStatus, string> = {
  pending: "bg-amber-500/20 text-amber-100",
  approved: "bg-emerald-500/20 text-emerald-100",
  rejected: "bg-red-500/20 text-red-200",
};

const LABELS: Record<EventPublicationStatus, string> = {
  pending: "Pending review",
  approved: "Published",
  rejected: "Rejected",
};

export function EventPublicationBadge({
  status,
  className,
}: {
  status: EventPublicationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
