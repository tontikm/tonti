"use client";

import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "./types";

type WizardStepperProps = {
  currentStep: number;
};

export function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <nav
      aria-label="Event creation progress"
      className="mb-8 overflow-x-auto rounded-2xl border border-violet-500/20 bg-violet-950/20 p-4"
    >
      <ol className="flex min-w-max items-center gap-2 sm:gap-4">
        {WIZARD_STEPS.map((item, index) => {
          const done = currentStep > item.id;
          const active = currentStep === item.id;
          return (
            <li key={item.id} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                    active && "bg-violet-600 text-white shadow-md shadow-violet-900/40",
                    done && !active && "bg-violet-500/30 text-violet-100",
                    !active && !done && "border border-white/15 text-muted",
                  )}
                >
                  {item.id}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : "text-muted",
                  )}
                >
                  {item.label}
                </span>
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden h-px w-8 sm:block",
                    done ? "bg-violet-500/50" : "bg-white/10",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
