"use server";

import { getPublicEventBySlug } from "@/lib/data/events";
import type { Event } from "@/lib/types";

export type LoadBasketEventResult =
  | { event: Event }
  | { error: string };

export async function loadBasketEvent(
  slug: string,
): Promise<LoadBasketEventResult> {
  const event = await getPublicEventBySlug(slug);
  if (!event) {
    return {
      error: "This event is no longer available. Clear your basket and try another show.",
    };
  }
  return { event };
}
