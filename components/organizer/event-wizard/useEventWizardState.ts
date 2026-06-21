"use client";

import { useState } from "react";
import { isoToSastDateAndTime } from "@/lib/utils";
import type { EventWizardState, OrganizerWizardDefaults } from "./types";

function defaultShow() {
  return isoToSastDateAndTime(new Date().toISOString());
}

export function useEventWizardState(defaults: OrganizerWizardDefaults) {
  const show = defaultShow();

  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [state, setState] = useState<EventWizardState>({
    title: "",
    slug: "",
    slugEdited: false,
    subtitle: "",
    description: "",
    posterFile: null,
    posterPreview: null,
    showDate: show.date,
    showTime: show.time,
    endDate: "",
    doorsMinutes: "60",
    category: "",
    venueName: "",
    venueSlug: "",
    venueCitySlug: "",
    venueAddress: "",
    venueCapacity: "500",
    lineup: [{ key: "lineup-0", name: "", slug: "" }],
    ageLimit: "",
    ageMax: "",
    prohibitedItems: [],
    tags: "",
    tiers: [
      {
        key: "1",
        id: "",
        name: "General Admission",
        price: "250",
        capacity: "500",
        description: "",
      },
    ],
    featured: false,
    showOrganizerProfile: false,
    acceptedTerms: false,
  });

  function patch(partial: Partial<EventWizardState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  return {
    step,
    setStep,
    stepError,
    setStepError,
    state,
    patch,
    defaults,
  };
}
