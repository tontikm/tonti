import type { FanUser } from "@/lib/auth/session";
import { getAllEvents } from "@/lib/data/events";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Event } from "@/lib/types";

export type FanFollowedEvents = {
  upcoming: Event[];
  past: Event[];
  all: Event[];
};

export async function followEvent(
  userId: string,
  eventSlug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Follows require Supabase." };
  }

  const slug = eventSlug.trim();
  if (!slug) return { ok: false, error: "Event not found." };

  const { data: event } = await supabase
    .from("events")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) return { ok: false, error: "Event not found." };

  const { error } = await supabase.from("event_follows").insert({
    user_id: userId,
    event_slug: slug,
  });

  if (error) {
    if (error.message.includes("duplicate") || error.code === "23505") {
      return { ok: true };
    }
    if (error.message.includes("event_follows")) {
      return {
        ok: false,
        error: "Run migration 0011_event_follows.sql in the Supabase SQL editor.",
      };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function unfollowEvent(
  userId: string,
  eventSlug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Follows require Supabase." };
  }

  const { error } = await supabase
    .from("event_follows")
    .delete()
    .eq("user_id", userId)
    .eq("event_slug", eventSlug.trim());

  if (error) {
    if (error.message.includes("event_follows")) {
      return {
        ok: false,
        error: "Run migration 0011_event_follows.sql in the Supabase SQL editor.",
      };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function isEventFollowed(
  userId: string,
  eventSlug: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data } = await supabase
    .from("event_follows")
    .select("event_slug")
    .eq("user_id", userId)
    .eq("event_slug", eventSlug)
    .maybeSingle();

  return Boolean(data);
}

export async function getFanFollowedEvents(
  user: FanUser,
): Promise<FanFollowedEvents> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { upcoming: [], past: [], all: [] };
  }

  const { data, error } = await supabase
    .from("event_follows")
    .select("event_slug, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return { upcoming: [], past: [], all: [] };
  }

  const slugOrder = data.map((row) => row.event_slug as string);
  const events = await getAllEvents();
  const eventBySlug = new Map(events.map((event) => [event.slug, event]));

  const followed = slugOrder
    .map((slug) => eventBySlug.get(slug))
    .filter((event): event is Event => Boolean(event));

  const now = new Date();
  const upcoming = followed
    .filter((event) => new Date(event.showTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.showTime).getTime() - new Date(b.showTime).getTime(),
    );
  const past = followed
    .filter((event) => new Date(event.showTime) < now)
    .sort(
      (a, b) =>
        new Date(b.showTime).getTime() - new Date(a.showTime).getTime(),
    );

  return {
    upcoming,
    past,
    all: [...upcoming, ...past],
  };
}
