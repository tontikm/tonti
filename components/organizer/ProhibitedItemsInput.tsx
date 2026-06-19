"use client";

import { useState } from "react";
import { X } from "lucide-react";

export const PROHIBITED_ITEM_PRESETS = [
  "Outside food",
  "Weapons",
  "Glass bottles",
  "Professional cameras",
  "Illegal substances",
] as const;

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

type ProhibitedItemsInputProps = {
  items: string[];
  onChange: (items: string[]) => void;
  /** When true, renders hidden inputs for traditional form posts */
  includeHiddenFields?: boolean;
};

export function ProhibitedItemsInput({
  items,
  onChange,
  includeHiddenFields = false,
}: ProhibitedItemsInputProps) {
  const [draft, setDraft] = useState("");

  function addItem(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (items.some((item) => item.toLowerCase() === lower)) return;
    onChange([...items, trimmed]);
    setDraft("");
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function togglePreset(preset: string) {
    const lower = preset.toLowerCase();
    if (items.some((item) => item.toLowerCase() === lower)) {
      onChange(items.filter((item) => item.toLowerCase() !== lower));
    } else {
      onChange([...items, preset]);
    }
  }

  return (
    <div>
      <label htmlFor="prohibitedItemsDraft" className={labelClass}>
        Prohibited items
      </label>
      <p className="mb-3 text-xs text-muted">
        Items fans cannot bring into the venue. Shown on the public event page.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {PROHIBITED_ITEM_PRESETS.map((preset) => {
          const active = items.some(
            (item) => item.toLowerCase() === preset.toLowerCase(),
          );
          return (
            <button
              key={preset}
              type="button"
              onClick={() => togglePreset(preset)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                active
                  ? "border-violet-500/50 bg-violet-500/20 text-violet-100"
                  : "border-white/15 text-muted hover:border-white/30 hover:text-foreground"
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          id="prohibitedItemsDraft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem(draft);
            }
          }}
          className={inputClass}
          placeholder="Type an item and press Enter"
        />
        <button
          type="button"
          onClick={() => addItem(draft)}
          className="shrink-0 rounded-xl border border-white/15 px-4 py-2 text-sm text-muted hover:text-foreground"
        >
          Add
        </button>
      </div>

      {items.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-muted hover:text-foreground"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {includeHiddenFields &&
        items.map((item) => (
          <input key={item} type="hidden" name="prohibitedItems" value={item} />
        ))}
    </div>
  );
}
