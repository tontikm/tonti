import type { Event } from "@/lib/types";
import type { OrganizerSession } from "@/lib/organizer/session";

export type OrganizerIdentity = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
};

export function eventBelongsToOrganizer(
  event: Event,
  organizer: OrganizerIdentity,
): boolean {
  if (
    organizer.id &&
    event.organizerId &&
    event.organizerId === organizer.id
  ) {
    return true;
  }

  if (
    organizer.email &&
    event.contactEmail &&
    event.contactEmail.toLowerCase() === organizer.email.toLowerCase()
  ) {
    return true;
  }

  if (
    organizer.name &&
    event.organizerName &&
    event.organizerName.toLowerCase() === organizer.name.toLowerCase()
  ) {
    return true;
  }

  return false;
}

export function isOwnOrganizerEvent(
  event: Event,
  session: OrganizerSession | null,
  options?: { id?: string | null; name?: string | null },
): boolean {
  if (!session) return false;

  return eventBelongsToOrganizer(event, {
    id: options?.id ?? session.id,
    email: session.email,
    name: options?.name ?? session.name,
  });
}
