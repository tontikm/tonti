"use client";

import Link from "next/link";
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
            Minimum age
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
          <label htmlFor="ageMax" className={labelClass}>
            Maximum age
          </label>
          <input
            id="ageMax"
            type="number"
            min={0}
            value={state.ageMax}
            onChange={(e) => onChange({ ageMax: e.target.value })}
            className={inputClass}
            placeholder="21"
          />
          <p className="mt-1 text-xs text-muted">
            Leave blank for all ages, or set a range (e.g. 16–21).
          </p>
        </div>
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

      <ProhibitedItemsInput
        items={state.prohibitedItems}
        onChange={(prohibitedItems) => onChange({ prohibitedItems })}
      />

      <div className="rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm text-muted">
        Refund rules for your event follow{" "}
        <Link
          href="/legal/refunds"
          target="_blank"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Spotra&apos;s refund policy
        </Link>
        . You&apos;ll confirm this on the final step before publishing.
      </div>
    </section>
  );
}
