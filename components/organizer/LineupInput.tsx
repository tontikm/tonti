"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { TypeaheadOption } from "@/components/organizer/EntityTypeahead";
import { EntityTypeahead } from "@/components/organizer/EntityTypeahead";

type LineupEntry = {
  key: string;
  name: string;
  slug: string;
};

type LineupInputProps = {
  artists: TypeaheadOption[];
  initialNames?: string[];
  initialSlugs?: string[];
};

export function LineupInput({
  artists,
  initialNames = [],
  initialSlugs = [],
}: LineupInputProps) {
  const [entries, setEntries] = useState<LineupEntry[]>(() => {
    if (initialSlugs.length > 0) {
      return initialSlugs.map((slug, index) => ({
        key: `${slug}-${index}`,
        slug,
        name: initialNames[index] ?? artists.find((a) => a.slug === slug)?.label ?? slug,
      }));
    }
    return [{ key: "lineup-0", name: "", slug: "" }];
  });

  function updateEntry(
    key: string,
    updates: Partial<Pick<LineupEntry, "name" | "slug">>,
  ) {
    setEntries((prev) => {
      let changed = false;
      const next = prev.map((entry) => {
        if (entry.key !== key) return entry;
        const updated = { ...entry, ...updates };
        if (updated.name === entry.name && updated.slug === entry.slug) {
          return entry;
        }
        changed = true;
        return updated;
      });
      return changed ? next : prev;
    });
  }

  function addEntry() {
    setEntries((prev) => [
      ...prev,
      { key: `lineup-${Date.now()}`, name: "", slug: "" },
    ]);
  }

  function removeEntry(key: string) {
    setEntries((prev) =>
      prev.length <= 1 ? prev : prev.filter((entry) => entry.key !== key),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Lineup</p>
          <p className="mt-1 text-xs text-muted">
            Type artist names. We&apos;ll match saved artists when possible.
          </p>
        </div>
        <button
          type="button"
          onClick={addEntry}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Add artist
        </button>
      </div>

      {entries.map((entry, index) => (
        <div key={entry.key} className="flex items-start gap-3">
          <div className="flex-1">
            <EntityTypeahead
              id={`lineup-${index}`}
              label={index === 0 ? "Artist" : `Artist ${index + 1}`}
              placeholder="Start typing an artist name"
              options={artists}
              value={entry.name}
              selectedSlug={entry.slug}
              onValueChange={(name) => updateEntry(entry.key, { name, slug: "" })}
              onSelect={(option) => {
                if (option) {
                  updateEntry(entry.key, {
                    name: option.label,
                    slug: option.slug,
                  });
                } else {
                  updateEntry(entry.key, { slug: "" });
                }
              }}
            />
            <input type="hidden" name="artistNames" value={entry.name} />
            <input type="hidden" name="artistSlugs" value={entry.slug} />
          </div>
          {entries.length > 1 && (
            <button
              type="button"
              onClick={() => removeEntry(entry.key)}
              className="mt-8 rounded-full border border-border p-2 text-muted hover:text-foreground"
              aria-label="Remove artist"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
