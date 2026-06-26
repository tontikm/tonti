import type { EventTicketWithBuyer } from "@/lib/types";
import type { OrganizerTicketDetail } from "@/components/organizer/OrganizerTicketDetailCard";

export function filterTicketsByQuery(
  tickets: EventTicketWithBuyer[],
  query: string,
): EventTicketWithBuyer[] {
  const q = query.trim().toLowerCase();
  if (!q) return tickets;

  return tickets.filter(
    (ticket) =>
      ticket.holderName.toLowerCase().includes(q) ||
      ticket.buyerName.toLowerCase().includes(q) ||
      ticket.buyerEmail.toLowerCase().includes(q) ||
      ticket.code.toLowerCase().includes(q) ||
      ticket.tierName.toLowerCase().includes(q),
  );
}

export function getRecentCheckInTickets(
  tickets: EventTicketWithBuyer[],
  limit = 5,
): EventTicketWithBuyer[] {
  return tickets
    .filter((ticket) => ticket.status === "used")
    .sort((a, b) => {
      const aTime = a.checkedInAt ? new Date(a.checkedInAt).getTime() : 0;
      const bTime = b.checkedInAt ? new Date(b.checkedInAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

export function toOrganizerTicketDetail(
  ticket: OrganizerTicketDetail,
): OrganizerTicketDetail {
  return {
    code: ticket.code,
    holderName: ticket.holderName,
    tierName: ticket.tierName,
    buyerName: ticket.buyerName,
    buyerEmail: ticket.buyerEmail,
    checkedInAt: ticket.checkedInAt,
  };
}
