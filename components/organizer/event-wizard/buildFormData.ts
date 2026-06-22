import { combineSastDateAndTime } from "@/lib/utils";
import type { EventWizardState } from "./types";

export function buildEventFormData(state: EventWizardState): FormData {
  const fd = new FormData();

  fd.set("title", state.title);
  fd.set("slug", state.slug);
  if (state.subtitle) fd.set("subtitle", state.subtitle);
  fd.set("description", state.description);
  if (state.posterFile) fd.set("poster", state.posterFile);
  if (state.heroBannerFile) fd.set("heroBanner", state.heroBannerFile);

  const showDateTime =
    state.showDate && state.showTime
      ? combineSastDateAndTime(state.showDate, state.showTime)
      : "";
  fd.set("showDateTime", showDateTime);

  if (state.endDate && state.showTime) {
    fd.set("endDateTime", combineSastDateAndTime(state.endDate, state.showTime));
  }

  fd.set("doorsMinutes", state.doorsMinutes);
  fd.set("category", state.category);
  fd.set("venueName", state.venueName);
  if (state.venueSlug) fd.set("venueSlug", state.venueSlug);
  if (state.venueCitySlug) fd.set("venueCitySlug", state.venueCitySlug);
  if (state.venueAddress) fd.set("venueAddress", state.venueAddress);
  fd.set("venueCapacity", state.venueCapacity);

  for (const entry of state.lineup) {
    if (entry.name.trim()) {
      fd.append("artistNames", entry.name.trim());
      fd.append("artistSlugs", entry.slug);
    }
  }

  if (state.ageLimit) fd.set("ageLimit", state.ageLimit);
  if (state.ageMax) fd.set("ageMax", state.ageMax);
  for (const item of state.prohibitedItems) {
    fd.append("prohibitedItems", item);
  }
  if (state.tags) fd.set("tags", state.tags);

  for (const tier of state.tiers) {
    fd.append("tierId", tier.id);
    fd.append("tierName", tier.name);
    fd.append("tierPrice", tier.price);
    fd.append("tierCapacity", tier.capacity);
    fd.append("tierDescription", tier.description);
  }

  if (state.showOrganizerProfile) fd.set("showOrganizerProfile", "on");
  if (state.acceptedTerms) fd.set("acceptTerms", "on");

  return fd;
}

export function validateWizardStep(
  step: number,
  state: EventWizardState,
): string | null {
  switch (step) {
    case 1:
      if (!state.title.trim()) return "Event title is required.";
      if (!state.slug.trim()) return "URL slug is required.";
      if (!state.description.trim()) return "Description is required.";
      if (!state.posterFile) return "Poster image is required.";
      return null;
    case 2:
      if (!state.showDate || !state.showTime) {
        return "Show date and time are required.";
      }
      if (!state.category) return "Select a category.";
      if (!state.venueName.trim()) return "Venue is required.";
      if (!state.venueSlug && !state.venueCitySlug) {
        return "Select a city for the new venue.";
      }
      return null;
    case 3:
      return null;
    case 4:
      if (state.tiers.length === 0 || !state.tiers[0]?.name.trim()) {
        return "Add at least one ticket tier.";
      }
      if (state.tiers.some((t) => !t.name.trim() || Number(t.capacity) <= 0)) {
        return "Each tier needs a name and capacity greater than 0.";
      }
      return null;
    case 5:
      if (!state.acceptedTerms) {
        return "Accept the terms to publish your event.";
      }
      return null;
    default:
      return null;
  }
}
