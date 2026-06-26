import { randomBytes } from "crypto";
import { getEventBySlug } from "@/lib/data/events";
import {
  hashOrganizerPassword,
  verifyOrganizerPassword,
} from "@/lib/auth/organizer-password";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Event } from "@/lib/types";
import type { OrganizerSession } from "@/lib/organizer/session";

export const DOOR_STAFF_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type EventDoorStaffMember = {
  id: string;
  email: string;
  name: string | null;
  assignmentStatus: "invited" | "active" | "revoked";
  staffStatus: "invited" | "active" | "suspended";
  inviteExpiresAt: string | null;
};

function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function getAssignedScannerEventsForSession(): Promise<Event[]> {
  const { getOrganizerSession } = await import("@/lib/organizer/session");
  const { isScannerSession } = await import("@/lib/organizer/require-auth");
  const session = await getOrganizerSession();
  if (!session || !isScannerSession(session)) {
    return [];
  }
  return getScannerEvents(session.scanEventSlugs ?? []);
}

export function buildDoorStaffJoinUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/organizer/staff/join?token=${encodeURIComponent(token)}`;
}

export async function getActiveScanEventSlugs(
  doorStaffId: string,
): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data } = await supabase
    .from("event_door_staff")
    .select("event_slug")
    .eq("door_staff_id", doorStaffId)
    .eq("status", "active");

  return (data ?? []).map((row) => row.event_slug as string);
}

export async function loginDoorStaff(
  email: string,
  password: string,
): Promise<OrganizerSession | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: staff } = await supabase
    .from("door_staff")
    .select("id, email, name, password_hash, status")
    .eq("email", email)
    .maybeSingle();

  if (!staff || staff.status !== "active") return null;
  if (
    !staff.password_hash ||
    !verifyOrganizerPassword(password, staff.password_hash as string)
  ) {
    return null;
  }

  const scanEventSlugs = await getActiveScanEventSlugs(staff.id as string);
  if (scanEventSlugs.length === 0) return null;

  const now = new Date().toISOString();
  return {
    role: "scanner",
    doorStaffId: staff.id as string,
    email: staff.email as string,
    name: (staff.name as string) ?? undefined,
    scanEventSlugs,
    loggedInAt: now,
    lastActivityAt: now,
  };
}

export async function listEventDoorStaff(
  eventSlug: string,
): Promise<EventDoorStaffMember[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("event_door_staff")
    .select(
      "id, status, invite_expires_at, door_staff:door_staff_id (email, name, status)",
    )
    .eq("event_slug", eventSlug)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const members: EventDoorStaffMember[] = [];
  for (const row of data) {
    const staff = row.door_staff as
      | { email: string; name: string | null; status: string }
      | { email: string; name: string | null; status: string }[]
      | null;
    const person = Array.isArray(staff) ? staff[0] : staff;
    if (!person) continue;

    members.push({
      id: row.id as string,
      email: person.email,
      name: person.name,
      assignmentStatus: row.status as EventDoorStaffMember["assignmentStatus"],
      staffStatus: person.status as EventDoorStaffMember["staffStatus"],
      inviteExpiresAt: (row.invite_expires_at as string) ?? null,
    });
  }
  return members;
}

export async function getScannerEvents(slugs: string[]): Promise<Event[]> {
  const events = await Promise.all(slugs.map((slug) => getEventBySlug(slug)));
  return events.filter((event): event is Event => Boolean(event));
}

export async function inviteDoorStaffForEvent(input: {
  eventSlug: string;
  email: string;
  name?: string | null;
  invitedByOrganizerId: string;
  origin: string;
}): Promise<
  | { ok: true; inviteUrl: string; member: EventDoorStaffMember }
  | { ok: false; error: string }
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const email = input.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const { data: existingOrganizer } = await supabase
    .from("organizers")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (existingOrganizer) {
    return {
      ok: false,
      error: "This email belongs to an organizer account. Use a different email for door staff.",
    };
  }

  let doorStaffId: string;
  let staffName = input.name?.trim() || null;
  let staffStatus: EventDoorStaffMember["staffStatus"] = "invited";

  const { data: existingStaff } = await supabase
    .from("door_staff")
    .select("id, name, status")
    .eq("email", email)
    .maybeSingle();

  if (existingStaff) {
    doorStaffId = existingStaff.id as string;
    staffStatus = existingStaff.status as EventDoorStaffMember["staffStatus"];
    if (!staffName && existingStaff.name) {
      staffName = existingStaff.name as string;
    }
    if (staffStatus === "suspended") {
      return { ok: false, error: "This door staff account is suspended." };
    }
  } else {
    const { data: created, error: createError } = await supabase
      .from("door_staff")
      .insert({
        email,
        name: staffName,
        status: "invited",
      })
      .select("id")
      .single();

    if (createError || !created) {
      if (
        createError?.message.includes("door_staff") ||
        createError?.message.includes("Could not find the table")
      ) {
        return {
          ok: false,
          error:
            "Run supabase/migrations/0028_door_staff.sql in the Supabase SQL editor.",
        };
      }
      return { ok: false, error: createError?.message ?? "Could not invite staff." };
    }

    doorStaffId = created.id as string;
  }

  const { data: existingAssignment } = await supabase
    .from("event_door_staff")
    .select("id, status")
    .eq("event_slug", input.eventSlug)
    .eq("door_staff_id", doorStaffId)
    .maybeSingle();

  if (existingAssignment?.status === "active") {
    return { ok: false, error: "This person already has scanner access for this event." };
  }

  const token = generateInviteToken();
  const inviteExpiresAt = new Date(
    Date.now() + DOOR_STAFF_INVITE_TTL_MS,
  ).toISOString();

  if (existingAssignment) {
    const { error: updateError } = await supabase
      .from("event_door_staff")
      .update({
        status: "invited",
        invite_token: token,
        invite_expires_at: inviteExpiresAt,
        invited_by: input.invitedByOrganizerId,
      })
      .eq("id", existingAssignment.id as string);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }
  } else {
    const { error: insertError } = await supabase.from("event_door_staff").insert({
      event_slug: input.eventSlug,
      door_staff_id: doorStaffId,
      invited_by: input.invitedByOrganizerId,
      invite_token: token,
      invite_expires_at: inviteExpiresAt,
      status: "invited",
    });

    if (insertError) {
      return { ok: false, error: insertError.message };
    }
  }

  if (staffName) {
    await supabase
      .from("door_staff")
      .update({ name: staffName })
      .eq("id", doorStaffId);
  }

  const members = await listEventDoorStaff(input.eventSlug);
  const member = members.find((row) => row.email === email);
  if (!member) {
    return { ok: false, error: "Could not load invited staff member." };
  }

  return {
    ok: true,
    inviteUrl: buildDoorStaffJoinUrl(input.origin, token),
    member,
  };
}

export async function revokeDoorStaffAssignment(
  assignmentId: string,
  eventSlug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { error } = await supabase
    .from("event_door_staff")
    .update({ status: "revoked", invite_token: null, invite_expires_at: null })
    .eq("id", assignmentId)
    .eq("event_slug", eventSlug);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function getDoorStaffInviteByToken(token: string): Promise<{
  assignmentId: string;
  eventSlug: string;
  eventTitle: string;
  email: string;
  name: string | null;
  expired: boolean;
} | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("event_door_staff")
    .select(
      "id, event_slug, invite_expires_at, status, door_staff:door_staff_id (email, name, status)",
    )
    .eq("invite_token", token)
    .maybeSingle();

  if (!data || data.status === "revoked") return null;

  const staff = data.door_staff as
    | { email: string; name: string | null; status: string }
    | { email: string; name: string | null; status: string }[]
    | null;
  const person = Array.isArray(staff) ? staff[0] : staff;
  if (!person || person.status === "suspended") return null;

  const event = await getEventBySlug(data.event_slug as string);
  if (!event) return null;

  const expiresAt = data.invite_expires_at
    ? new Date(data.invite_expires_at as string).getTime()
    : 0;

  return {
    assignmentId: data.id as string,
    eventSlug: data.event_slug as string,
    eventTitle: event.title,
    email: person.email,
    name: person.name,
    expired: expiresAt > 0 && expiresAt < Date.now(),
  };
}

export async function acceptDoorStaffInvite(
  token: string,
  password: string,
  name?: string | null,
): Promise<
  | { ok: true; session: OrganizerSession }
  | { ok: false; error: string }
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const invite = await getDoorStaffInviteByToken(token);
  if (!invite) {
    return { ok: false, error: "This invite link is invalid or has been revoked." };
  }
  if (invite.expired) {
    return { ok: false, error: "This invite link has expired. Ask the organizer for a new one." };
  }

  const { data: assignment } = await supabase
    .from("event_door_staff")
    .select("door_staff_id")
    .eq("id", invite.assignmentId)
    .maybeSingle();

  if (!assignment) {
    return { ok: false, error: "Invite not found." };
  }

  const doorStaffId = assignment.door_staff_id as string;
  const displayName = name?.trim() || invite.name;

  const { error: staffError } = await supabase
    .from("door_staff")
    .update({
      password_hash: hashOrganizerPassword(password),
      status: "active",
      name: displayName,
    })
    .eq("id", doorStaffId);

  if (staffError) {
    return { ok: false, error: staffError.message };
  }

  const { error: assignmentError } = await supabase
    .from("event_door_staff")
    .update({
      status: "active",
      invite_token: null,
      invite_expires_at: null,
    })
    .eq("id", invite.assignmentId);

  if (assignmentError) {
    return { ok: false, error: assignmentError.message };
  }

  const scanEventSlugs = await getActiveScanEventSlugs(doorStaffId);
  const now = new Date().toISOString();

  return {
    ok: true,
    session: {
      role: "scanner",
      doorStaffId,
      email: invite.email,
      name: displayName ?? undefined,
      scanEventSlugs,
      loggedInAt: now,
      lastActivityAt: now,
    },
  };
}
