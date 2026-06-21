import { getEventBySlug } from "@/lib/data/events";
import type { Event } from "@/lib/types";
import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { isOwnOrganizerEvent } from "@/lib/organizer/ownership";
import {
  getOrganizerSession,
  type OrganizerSession,
} from "@/lib/organizer/session";

export type OrganizerAuthError = { error: string };

export async function requireOrganizerSession(): Promise<
  OrganizerSession | OrganizerAuthError
> {
  const session = await getOrganizerSession();
  if (!session) {
    return { error: "You must be signed in as an organizer." };
  }
  return session;
}

export async function requireOwnEvent(
  slug: string,
): Promise<{ session: OrganizerSession; event: Event } | OrganizerAuthError> {
  const sessionResult = await requireOrganizerSession();
  if ("error" in sessionResult) {
    return sessionResult;
  }

  const event = await getEventBySlug(slug);
  if (!event) {
    return { error: "Event not found." };
  }

  const profile = await getOrganizerByEmail(sessionResult.email);
  if (!isOwnOrganizerEvent(event, sessionResult, {
    id: profile?.id,
    name: profile?.name,
  })) {
    return { error: "You do not have permission to manage this event." };
  }

  return { session: sessionResult, event };
}
