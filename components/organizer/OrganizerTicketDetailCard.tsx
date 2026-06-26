import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { formatEventTime } from "@/lib/utils";

export type OrganizerTicketDetail = {
  code: string;
  holderName: string;
  tierName: string;
  buyerName?: string;
  buyerEmail: string;
  checkedInAt?: string;
};

type OrganizerTicketDetailCardProps = {
  ticket: OrganizerTicketDetail;
  variant?: "checkedIn" | "alreadyUsed" | "plain";
  className?: string;
};

export function OrganizerTicketDetailCard({
  ticket,
  variant = "checkedIn",
  className = "",
}: OrganizerTicketDetailCardProps) {
  const isAlreadyUsed = variant === "alreadyUsed";
  const showBadge = variant !== "plain";

  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/30 p-4 ${className}`}
    >
      {showBadge ? (
      <div className="flex flex-wrap items-center gap-2">
        {isAlreadyUsed ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
            <AlertCircle className="h-3 w-3" />
            Already checked in
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Checked in
          </span>
        )}
      </div>
      ) : null}

      <dl className={`space-y-3 text-sm ${showBadge ? "mt-4" : ""}`}>
        <DetailRow label="Ticket code">
          <span className="font-mono text-xs tracking-wide">{ticket.code}</span>
        </DetailRow>
        <DetailRow label="Holder">{ticket.holderName}</DetailRow>
        <DetailRow label="Tier">{ticket.tierName}</DetailRow>
        {ticket.buyerName ? (
          <DetailRow label="Buyer">{ticket.buyerName}</DetailRow>
        ) : null}
        <DetailRow label="Email">{ticket.buyerEmail}</DetailRow>
        {ticket.checkedInAt ? (
          <DetailRow label={isAlreadyUsed ? "Checked in at" : "Checked in at"}>
            {new Date(ticket.checkedInAt).toLocaleString("en-ZA")} (
            {formatEventTime(ticket.checkedInAt)})
          </DetailRow>
        ) : null}
      </dl>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-foreground">{children}</dd>
    </div>
  );
}
