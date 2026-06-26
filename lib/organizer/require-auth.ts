import { getEventBySlug } from "@/lib/data/events";
import type { Event } from "@/lib/types";
import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { isOwnOrganizerEvent } from "@/lib/organizer/ownership";
import {
  getOrganizerSession,
  type OrganizerSession,
} from "@/lib/organizer/session";

export type OrganizerAuthError = { error: string };

export function isScannerSession(session: OrganizerSession): boolean {
  return session.role === "scanner";
}

export async function requireOrganizerSession(): Promise<
  OrganizerSession | OrganizerAuthError
> {
  const session = await getOrganizerSession();
  if (!session) {
    return { error: "You must be signed in as an organizer." };
  }
  return session;
}

export async function requireOwnerSession(): Promise<
  OrganizerSession | OrganizerAuthError
> {
  const sessionResult = await requireOrganizerSession();
  if ("error" in sessionResult) {
    return sessionResult;
  }

  if (isScannerSession(sessionResult)) {
    return { error: "You do not have permission to manage events." };
  }

  return sessionResult;
}

export async function requireScanAccess(
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

  if (isScannerSession(sessionResult)) {
    if (!sessionResult.scanEventSlugs?.includes(slug)) {
      return {
        error: "You do not have permission to scan tickets for this event.",
      };
    }
    return { session: sessionResult, event };
  }

  const profile = await getOrganizerByEmail(sessionResult.email);
  if (
    !isOwnOrganizerEvent(event, sessionResult, {
      id: profile?.id,
      name: profile?.name,
    })
  ) {
    return { error: "You do not have permission to manage this event." };
  }

  return { session: sessionResult, event };
}

export async function requireOwnEvent(
  slug: string,
): Promise<{ session: OrganizerSession; event: Event } | OrganizerAuthError> {
  const sessionResult = await requireOwnerSession();
  if ("error" in sessionResult) {
    return sessionResult;
  }

  const event = await getEventBySlug(slug);
  if (!event) {
    return { error: "Event not found." };
  }

  const profile = await getOrganizerByEmail(sessionResult.email);
  if (
    !isOwnOrganizerEvent(event, sessionResult, {
      id: profile?.id,
      name: profile?.name,
    })
  ) {
    return { error: "You do not have permission to manage this event." };
  }

  return { session: sessionResult, event };
}
