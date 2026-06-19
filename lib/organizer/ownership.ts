import type { Event } from "@/lib/types";
import type { OrganizerSession } from "@/lib/organizer/session";

export function isOwnOrganizerEvent(
  event: Event,
  session: OrganizerSession | null,
  organizerName?: string | null,
): boolean {
  if (!session) return false;

  if (event.organizerId && session.id) {
    return event.organizerId === session.id;
  }

  const name = organizerName ?? session.name;
  if (name && event.organizerName) {
    return event.organizerName.toLowerCase() === name.toLowerCase();
  }

  return false;
}
