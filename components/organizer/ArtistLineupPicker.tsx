"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { quickCreateArtist } from "@/app/organizer/actions";
import { cn } from "@/lib/utils";

export type ArtistPickerOption = {
  slug: string;
  label: string;
  sublabel?: string;
};

export type LineupSelection = {
  slug: string;
  name: string;
};

type ArtistLineupPickerProps = {
  artists: ArtistPickerOption[];
  selected: LineupSelection[];
  onSelectedChange: (selected: LineupSelection[]) => void;
  onArtistsChange?: (artists: ArtistPickerOption[]) => void;
  formMode?: boolean;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function ArtistLineupPicker({
  artists,
  selected,
  onSelectedChange,
  onArtistsChange,
  formMode = false,
}: ArtistLineupPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedSlugs = useMemo(
    () => new Set(selected.map((item) => item.slug)),
    [selected],
  );

  const matches = useMemo(() => {
    const needle = normalize(query);
    const available = artists.filter((artist) => !selectedSlugs.has(artist.slug));

    if (!needle) return available.slice(0, 10);

    const filtered = available.filter(
      (artist) =>
        normalize(artist.label).includes(needle) ||
        normalize(artist.sublabel ?? "").includes(needle),
    );

    const exact = filtered.filter(
      (artist) => normalize(artist.label) === needle,
    );
    const rest = filtered.filter(
      (artist) => normalize(artist.label) !== needle,
    );

    return [...exact, ...rest].slice(0, 10);
  }, [artists, query, selectedSlugs]);

  const trimmedQuery = query.trim();
  const hasExactMatch = artists.some(
    (artist) => normalize(artist.label) === normalize(trimmedQuery),
  );
  const showCreateOption =
    trimmedQuery.length > 0 &&
    !hasExactMatch &&
    !selected.some((item) => normalize(item.name) === normalize(trimmedQuery));

  function addSelection(option: LineupSelection) {
    if (selectedSlugs.has(option.slug)) return;
    onSelectedChange([...selected, option]);
    setQuery("");
    setOpen(false);
    setError(null);
  }

  function removeSelection(slug: string) {
    onSelectedChange(selected.filter((item) => item.slug !== slug));
  }

  function handleQuickCreate() {
    if (!trimmedQuery || isPending) return;

    startTransition(async () => {
      setError(null);
      const result = await quickCreateArtist(trimmedQuery);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      const option: ArtistPickerOption = {
        slug: result.slug,
        label: result.name,
      };

      onArtistsChange?.([
        ...artists.filter((artist) => artist.slug !== option.slug),
        option,
      ]);
      addSelection({ slug: result.slug, name: result.name });
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">Lineup</p>
        <p className="mt-1 text-xs text-muted">
          Search and select artists. Add a new name if they&apos;re not listed yet.
        </p>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item.slug}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
            >
              {item.name}
              <button
                type="button"
                onClick={() => removeSelection(item.slug)}
                className="rounded-full text-muted hover:text-foreground"
                aria-label={`Remove ${item.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          value={query}
          placeholder="Search artists…"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (showCreateOption) {
                handleQuickCreate();
              } else if (matches[0]) {
                addSelection({
                  slug: matches[0].slug,
                  name: matches[0].label,
                });
              }
            }
          }}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none"
        />

        {open && (matches.length > 0 || showCreateOption) && (
          <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-border bg-black shadow-xl">
            {matches.map((option) => (
              <li key={option.slug}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() =>
                    addSelection({ slug: option.slug, name: option.label })
                  }
                  className="flex w-full flex-col items-start px-4 py-3 text-left text-sm hover:bg-white/5"
                >
                  <span className="font-medium">{option.label}</span>
                  {option.sublabel && (
                    <span className="text-xs text-muted">{option.sublabel}</span>
                  )}
                </button>
              </li>
            ))}

            {showCreateOption && (
              <li className="border-t border-white/10">
                <button
                  type="button"
                  disabled={isPending}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleQuickCreate}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-white/5",
                    isPending && "opacity-60",
                  )}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add &ldquo;{trimmedQuery}&rdquo; as new artist
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-300">{error}</p>
      )}

      {formMode &&
        selected.map((item) => (
          <span key={`hidden-${item.slug}`} className="hidden">
            <input type="hidden" name="artistNames" value={item.name} />
            <input type="hidden" name="artistSlugs" value={item.slug} />
          </span>
        ))}
    </div>
  );
}
