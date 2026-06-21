import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
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
  className?: string;
};

export function OrganizerTicketDetailCard({
  ticket,
  className = "",
}: OrganizerTicketDetailCardProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/30 p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Checked in
        </span>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
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
          <DetailRow label="Checked in at">
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
