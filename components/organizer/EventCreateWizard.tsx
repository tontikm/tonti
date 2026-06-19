"use client";

import { startTransition, useActionState } from "react";
import type { Artist, Venue } from "@/lib/types";
import { createEvent, type ActionState } from "@/app/organizer/actions";
import { Button } from "@/components/ui/Button";
import { buildEventFormData, validateWizardStep } from "./event-wizard/buildFormData";
import { StepBasics } from "./event-wizard/StepBasics";
import { StepReview } from "./event-wizard/StepReview";
import { StepRules } from "./event-wizard/StepRules";
import { StepSchedule } from "./event-wizard/StepSchedule";
import { StepTickets } from "./event-wizard/StepTickets";
import type { OrganizerWizardDefaults } from "./event-wizard/types";
import { useEventWizardState } from "./event-wizard/useEventWizardState";
import { WizardStepper } from "./event-wizard/WizardStepper";

type EventCreateWizardProps = {
  venues: Venue[];
  artists: Artist[];
  defaults: OrganizerWizardDefaults;
};

export function EventCreateWizard({
  venues,
  artists,
  defaults,
}: EventCreateWizardProps) {
  const { step, setStep, stepError, setStepError, state, patch, defaults: profile } =
    useEventWizardState(defaults);

  const [actionState, formAction, pending] = useActionState<ActionState, FormData>(
    createEvent,
    {},
  );

  function goBack() {
    setStepError(null);
    setStep((current) => Math.max(1, current - 1));
  }

  function goNext() {
    const error = validateWizardStep(step, state);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep((current) => Math.min(5, current + 1));
  }

  function publish() {
    const ticketsError = validateWizardStep(4, state);
    if (ticketsError) {
      setStepError(ticketsError);
      setStep(4);
      return;
    }
    const termsError = validateWizardStep(5, state);
    if (termsError) {
      setStepError(termsError);
      return;
    }
    setStepError(null);
    const fd = buildEventFormData(state);
    if (defaults.id) fd.set("organizerId", defaults.id);
    startTransition(() => {
      formAction(fd);
    });
  }

  const isReviewStep = step === 5;

  return (
    <div className={isReviewStep ? "max-w-4xl" : "max-w-3xl"}>
      <WizardStepper currentStep={step} />

      {(stepError || actionState.error) && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
          {stepError ?? actionState.error}
        </div>
      )}

      <div
        className={
          isReviewStep
            ? "rounded-2xl border border-violet-500/15 bg-violet-950/10 p-6 sm:p-8"
            : undefined
        }
      >
        {step === 1 && <StepBasics state={state} onChange={patch} />}
        {step === 2 && (
          <StepSchedule
            state={state}
            venues={venues}
            artists={artists}
            onChange={patch}
          />
        )}
        {step === 3 && <StepRules state={state} onChange={patch} />}
        {step === 4 && <StepTickets state={state} onChange={patch} />}
        {step === 5 && (
          <StepReview state={state} defaults={profile} onChange={patch} />
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
        {step > 1 && (
          <Button type="button" variant="secondary" size="lg" onClick={goBack}>
            Back
          </Button>
        )}
        {step < 5 ? (
          <Button
            type="button"
            size="lg"
            className="organizer-accent-btn"
            onClick={goNext}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="organizer-accent-btn"
            disabled={pending || !state.acceptedTerms}
            onClick={publish}
          >
            {pending ? "Publishing…" : "Publish event"}
          </Button>
        )}
        <Button href="/organizer/events" variant="secondary" size="lg">
          Cancel
        </Button>
      </div>
    </div>
  );
}
