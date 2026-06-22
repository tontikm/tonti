import type { EventCategory } from "@/lib/types";

export type WizardTier = {
  key: string;
  id: string;
  name: string;
  price: string;
  capacity: string;
  description: string;
};

export type WizardLineupEntry = {
  key: string;
  name: string;
  slug: string;
};

export type EventWizardState = {
  title: string;
  slug: string;
  slugEdited: boolean;
  subtitle: string;
  description: string;
  posterFile: File | null;
  posterPreview: string | null;
  heroBannerFile: File | null;
  heroBannerPreview: string | null;
  showDate: string;
  showTime: string;
  endDate: string;
  doorsMinutes: string;
  category: EventCategory | "";
  venueName: string;
  venueSlug: string;
  venueCitySlug: string;
  venueAddress: string;
  venueCapacity: string;
  lineup: WizardLineupEntry[];
  ageLimit: string;
  ageMax: string;
  prohibitedItems: string[];
  tags: string;
  tiers: WizardTier[];
  featured: boolean;
  showOrganizerProfile: boolean;
  acceptedTerms: boolean;
};

export type OrganizerWizardDefaults = {
  id: string | null;
  name: string | null;
  logo: string | null;
  email: string;
};

export const WIZARD_STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Schedule & venue" },
  { id: 3, label: "Rules & policies" },
  { id: 4, label: "Tickets" },
  { id: 5, label: "Review & publish" },
] as const;
