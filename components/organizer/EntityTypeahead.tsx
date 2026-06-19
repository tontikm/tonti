"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type TypeaheadOption = {
  slug: string;
  label: string;
  sublabel?: string;
};

type EntityTypeaheadProps = {
  id: string;
  label: string;
  placeholder: string;
  options: TypeaheadOption[];
  value: string;
  selectedSlug: string;
  onValueChange: (value: string) => void;
  onSelect: (option: TypeaheadOption | null) => void;
  required?: boolean;
  helperText?: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function EntityTypeahead({
  id,
  label,
  placeholder,
  options,
  value,
  selectedSlug,
  onValueChange,
  onSelect,
  required = false,
  helperText,
}: EntityTypeaheadProps) {
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const needle = normalize(value);
    if (!needle) return options.slice(0, 8);
    return options
      .filter(
        (option) =>
          normalize(option.label).includes(needle) ||
          normalize(option.sublabel ?? "").includes(needle),
      )
      .slice(0, 8);
  }, [options, value]);

  function applySelection(nextValue: string) {
    onValueChange(nextValue);
    setOpen(true);

    if (!nextValue.trim()) {
      onSelect(null);
      return;
    }

    const exact = options.find(
      (option) => normalize(option.label) === normalize(nextValue),
    );
    onSelect(exact ?? null);
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(event) => applySelection(event.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none"
      />
      <input type="hidden" name={`${id}Slug`} value={selectedSlug} />

      {selectedSlug && (
        <p className="mt-1 text-xs text-muted">Matched saved entry</p>
      )}

      {helperText && (
        <p className="mt-1 text-xs text-muted">{helperText}</p>
      )}

      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-border bg-black shadow-xl">
          {matches.map((option) => (
            <li key={option.slug}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onValueChange(option.label);
                  onSelect(option);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full flex-col items-start px-4 py-3 text-left text-sm hover:bg-white/5",
                  selectedSlug === option.slug && "bg-white/5",
                )}
              >
                <span className="font-medium">{option.label}</span>
                {option.sublabel && (
                  <span className="text-xs text-muted">{option.sublabel}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
