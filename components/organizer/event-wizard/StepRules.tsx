"use client";

import { ProhibitedItemsInput } from "@/components/organizer/ProhibitedItemsInput";
import { inputClass, labelClass } from "./shared";
import type { EventWizardState } from "./types";

type StepRulesProps = {
  state: EventWizardState;
  onChange: (patch: Partial<EventWizardState>) => void;
};

export function StepRules({ state, onChange }: StepRulesProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Rules & policies</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ageLimit" className={labelClass}>
            Age limit (e.g. 18 for adult events)
          </label>
          <input
            id="ageLimit"
            type="number"
            min={0}
            value={state.ageLimit}
            onChange={(e) => onChange({ ageLimit: e.target.value })}
            className={inputClass}
            placeholder="18"
          />
        </div>
        <div>
          <label htmlFor="tags" className={labelClass}>
            Tags
          </label>
          <input
            id="tags"
            value={state.tags}
            onChange={(e) => onChange({ tags: e.target.value })}
            className={inputClass}
            placeholder="festival, outdoor, amapiano"
          />
          <p className="mt-1 text-xs text-muted">Comma-separated</p>
        </div>
      </div>

      <ProhibitedItemsInput
        items={state.prohibitedItems}
        onChange={(prohibitedItems) => onChange({ prohibitedItems })}
      />

      <div>
        <label htmlFor="contactEmail" className={labelClass}>
          Day-of contact email
        </label>
        <input
          id="contactEmail"
          type="email"
          value={state.contactEmail}
          onChange={(e) => onChange({ contactEmail: e.target.value })}
          className={inputClass}
          placeholder="promoter@example.com"
        />
        <p className="mt-1 text-xs text-muted">
          Shown to fans for support queries about this event.
        </p>
      </div>

      <div>
        <label htmlFor="refundPolicy" className={labelClass}>
          Refund policy
        </label>
        <textarea
          id="refundPolicy"
          rows={4}
          value={state.refundPolicy}
          onChange={(e) => onChange({ refundPolicy: e.target.value })}
          className={inputClass}
          placeholder="All sales are final unless the event is cancelled…"
        />
      </div>
    </section>
  );
}
