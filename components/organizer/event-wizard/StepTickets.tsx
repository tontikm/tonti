"use client";

import { Plus, Trash2 } from "lucide-react";
import { inputClass } from "./shared";
import type { EventWizardState, WizardTier } from "./types";

type StepTicketsProps = {
  state: EventWizardState;
  onChange: (patch: Partial<EventWizardState>) => void;
};

export function StepTickets({ state, onChange }: StepTicketsProps) {
  function addTier() {
    onChange({
      tiers: [
        ...state.tiers,
        {
          key: String(Date.now()),
          id: "",
          name: "",
          price: "0",
          capacity: "100",
          description: "",
        },
      ],
    });
  }

  function removeTier(key: string) {
    if (state.tiers.length <= 1) return;
    onChange({ tiers: state.tiers.filter((tier) => tier.key !== key) });
  }

  function updateTier(key: string, field: keyof WizardTier, value: string) {
    onChange({
      tiers: state.tiers.map((tier) =>
        tier.key === key ? { ...tier, [field]: value } : tier,
      ),
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ticket tiers</h2>
        <button
          type="button"
          onClick={addTier}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Add tier
        </button>
      </div>

      <div className="space-y-4">
        {state.tiers.map((tier) => (
          <div
            key={tier.key}
            className="rounded-2xl border border-border bg-surface/50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Tier</span>
              {state.tiers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTier(tier.key)}
                  className="text-muted hover:text-foreground"
                  aria-label="Remove tier"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                value={tier.name}
                onChange={(e) => updateTier(tier.key, "name", e.target.value)}
                className={inputClass}
                placeholder="Tier name"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={tier.price}
                onChange={(e) => updateTier(tier.key, "price", e.target.value)}
                className={inputClass}
                placeholder="Price (ZAR)"
              />
              <input
                type="number"
                min={1}
                required
                value={tier.capacity}
                onChange={(e) =>
                  updateTier(tier.key, "capacity", e.target.value)
                }
                className={inputClass}
                placeholder="Capacity"
              />
              <input
                value={tier.description}
                onChange={(e) =>
                  updateTier(tier.key, "description", e.target.value)
                }
                className={inputClass}
                placeholder="Description (optional)"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
