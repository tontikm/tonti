import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, ShieldCheck, ShieldX } from "lucide-react";
import { CheckInButton } from "@/components/tickets/CheckInButton";
import { TicketQr } from "@/components/tickets/TicketQr";
import { getEventBySlug } from "@/lib/data/events";
import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { isOwnOrganizerEvent } from "@/lib/organizer/ownership";
import { getOrganizerSession } from "@/lib/organizer/session";
import { getTicketByCode } from "@/lib/tickets";
import { formatEventDate, formatEventTime } from "@/lib/utils";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  const ticket = await getTicketByCode(code);
  return {
    title: ticket ? `Ticket ${ticket.code}` : "Verify ticket",
  };
}

export default async function TicketVerifyPage({ params }: Props) {
  const { code } = await params;
  const ticket = await getTicketByCode(code);
  if (!ticket) notFound();

  const event = await getEventBySlug(ticket.eventSlug);
  if (!event) notFound();

  const organizerSession = await getOrganizerSession();
  const organizerProfile = organizerSession
    ? await getOrganizerByEmail(organizerSession.email)
    : null;
  const canCheckIn = isOwnOrganizerEvent(
    event,
    organizerSession,
    organizerProfile?.name,
  );

  const isValid = ticket.status === "valid";
  const isUsed = ticket.status === "used";

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div
        className={`rounded-2xl border p-6 ${
          isValid
            ? "border-emerald-500/30 bg-emerald-500/10"
            : isUsed
              ? "border-amber-500/30 bg-amber-500/10"
              : "border-red-500/30 bg-red-500/10"
        }`}
      >
        <div className="flex items-start gap-3">
          {isValid ? (
            <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-400" />
          ) : (
            <ShieldX className="h-6 w-6 shrink-0 text-amber-400" />
          )}
          <div>
            <h1 className="text-xl font-bold">
              {isValid ? "Valid ticket" : isUsed ? "Already checked in" : "Invalid ticket"}
            </h1>
            <p className="mt-1 font-mono text-sm text-muted">{ticket.code}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <TicketQr code={ticket.code} size={200} />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">{event.title}</h2>
        <p className="mt-2 text-sm font-medium">{ticket.tierName}</p>
        <p className="mt-1 text-sm text-muted">{ticket.holderName}</p>
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            {formatEventDate(event.date)} · Doors {formatEventTime(event.doorsTime)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            {event.venue.name}, {event.venue.city}
          </p>
        </div>
      </div>

      {isValid && canCheckIn && (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Door check-in
          </h3>
          <p className="mt-2 text-sm text-muted">
            Mark this ticket as scanned at entry.
          </p>
          <div className="mt-4">
            <CheckInButton code={ticket.code} />
          </div>
        </div>
      )}

      {isUsed && ticket.checkedInAt && (
        <p className="mt-6 text-center text-sm text-muted">
          Checked in at {new Date(ticket.checkedInAt).toLocaleString("en-ZA")}
        </p>
      )}

      <div className="mt-8 text-center">
        <Link href={`/events/${event.slug}`} className="text-sm text-muted hover:text-foreground">
          View event
        </Link>
      </div>
    </div>
  );
}
