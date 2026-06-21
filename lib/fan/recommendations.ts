import type { FanUser } from "@/lib/auth/session";
import type { Event } from "@/lib/types";
import { getPublicEvents } from "@/lib/data/events";
import { getFanFollowedEvents } from "@/lib/fan/follows";
import { getFanOrders } from "@/lib/fan/orders";

/**
 * Recommends upcoming events for a fan based on the categories and cities of
 * events they already follow or have bought tickets for. Returns an empty list
 * for signed-out users or when there is not enough signal.
 */
export async function getRecommendedEvents(
  user: FanUser | null,
  limit = 6,
): Promise<Event[]> {
  if (!user) return [];

  const [followed, orders, allEvents] = await Promise.all([
    getFanFollowedEvents(user),
    getFanOrders(user),
    getPublicEvents(),
  ]);

  const seedEvents: Event[] = [
    ...followed.all,
    ...orders.map((o) => o.event).filter((e): e is Event => Boolean(e)),
  ];

  if (seedEvents.length === 0) return [];

  const seenSlugs = new Set(seedEvents.map((e) => e.slug));
  const categoryWeight = new Map<string, number>();
  const cityWeight = new Map<string, number>();
  for (const event of seedEvents) {
    categoryWeight.set(
      event.category,
      (categoryWeight.get(event.category) ?? 0) + 1,
    );
    cityWeight.set(
      event.venue.city,
      (cityWeight.get(event.venue.city) ?? 0) + 1,
    );
  }

  const now = new Date();
  const scored = allEvents
    .filter(
      (event) =>
        !seenSlugs.has(event.slug) && new Date(event.showTime) >= now,
    )
    .map((event) => {
      const score =
        (categoryWeight.get(event.category) ?? 0) * 2 +
        (cityWeight.get(event.venue.city) ?? 0);
      return { event, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(a.event.showTime).getTime() -
        new Date(b.event.showTime).getTime()
      );
    });

  return scored.slice(0, limit).map((item) => item.event);
}
