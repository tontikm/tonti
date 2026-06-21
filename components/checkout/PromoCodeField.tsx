"use client";

import { useState, useTransition } from "react";
import { Tag } from "lucide-react";
import { previewPromoCode } from "@/app/events/actions";
import type { PromoPreview } from "@/lib/promo/codes";

type PromoCodeFieldProps = {
  eventSlug: string;
  selectionsJson: string;
  disabled?: boolean;
  applied: PromoPreview | null;
  onApplied: (preview: PromoPreview | null) => void;
};

export function PromoCodeField({
  eventSlug,
  selectionsJson,
  disabled,
  applied,
  onApplied,
}: PromoCodeFieldProps) {
  const [code, setCode] = useState(applied?.code ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleApply() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a promo code.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await previewPromoCode(eventSlug, trimmed, selectionsJson);
      if (result.error) {
        setError(result.error);
        onApplied(null);
        return;
      }
      if (result.preview) {
        onApplied(result.preview);
        setCode(result.preview.code);
      }
    });
  }

  function handleRemove() {
    setCode("");
    setError(null);
    onApplied(null);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold">Promo code</h2>
      </div>

      {applied ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-emerald-300">
            <span className="font-mono font-medium">{applied.code}</span> applied
          </p>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-muted hover:text-foreground"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            disabled={disabled || pending}
            placeholder="SUMMER20"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal focus:border-white/40 focus:outline-none"
            aria-label="Promo code"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={disabled || pending}
            className="shrink-0 rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium transition-colors hover:border-foreground/40 disabled:opacity-50"
          >
            {pending ? "Checking…" : "Apply"}
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
