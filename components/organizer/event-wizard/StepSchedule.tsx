"use client";

import { Plus, X } from "lucide-react";
import type { Artist, EventCategory, Venue } from "@/lib/types";
import { EVENT_CATEGORIES } from "@/lib/data/categories";
import { EventDateTimeFields } from "@/components/organizer/EventDateTimeFields";
import { EntityTypeahead } from "@/components/organizer/EntityTypeahead";
import { NewVenueFields } from "@/components/organizer/NewVenueFields";
import { inputClass, labelClass } from "./shared";
import type { EventWizardState } from "./types";

type StepScheduleProps = {
  state: EventWizardState;
  venues: Venue[];
  artists: Artist[];
  onChange: (patch: Partial<EventWizardState>) => void;
};

export function StepSchedule({
  state,
  venues,
  artists,
  onChange,
}: StepScheduleProps) {
  const venueOptions = venues.map((venue) => ({
    slug: venue.slug,
    label: venue.name,
    sublabel: `${venue.city}, ${venue.province}`,
  }));

  const artistOptions = artists.map((artist) => ({
    slug: artist.slug,
    label: artist.name,
  }));

  function updateLineup(
    key: string,
    updates: Partial<{ name: string; slug: string }>,
  ) {
    onChange({
      lineup: state.lineup.map((entry) =>
        entry.key === key ? { ...entry, ...updates } : entry,
      ),
    });
  }

  function addLineupEntry() {
    onChange({
      lineup: [
        ...state.lineup,
        { key: `lineup-${Date.now()}`, name: "", slug: "" },
      ],
    });
  }

  function removeLineupEntry(key: string) {
    if (state.lineup.length <= 1) return;
    onChange({ lineup: state.lineup.filter((entry) => entry.key !== key) });
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Date & venue</h2>

      <EventDateTimeFields
        showDate={state.showDate}
        showTime={state.showTime}
        endDate={state.endDate}
        onShowDateChange={(showDate) => onChange({ showDate })}
        onShowTimeChange={(showTime) => onChange({ showTime })}
        onEndDateChange={(endDate) => onChange({ endDate })}
      />

      <div>
        <label htmlFor="doorsMinutes" className={labelClass}>
          Doors open (minutes before show)
        </label>
        <input
          id="doorsMinutes"
          type="number"
          min={0}
          value={state.doorsMinutes}
          onChange={(e) => onChange({ doorsMinutes: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>
            Category *
          </label>
          <select
            id="category"
            required
            value={state.category}
            onChange={(e) =>
              onChange({ category: e.target.value as EventCategory })
            }
            className={inputClass}
          >
            <option value="">Select category</option>
            {EVENT_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <EntityTypeahead
            id="venue"
            label="Venue *"
            placeholder="Start typing a venue name"
            options={venueOptions}
            value={state.venueName}
            selectedSlug={state.venueSlug}
            onValueChange={(name) => onChange({ venueName: name, venueSlug: "" })}
            onSelect={(option) => onChange({ venueSlug: option?.slug ?? "" })}
            required
            helperText="Matches saved venues, or add details below for a new venue."
          />
        </div>
      </div>

      {state.venueName.trim() && !state.venueSlug && (
        <NewVenueFields
          citySlug={state.venueCitySlug}
          address={state.venueAddress}
          capacity={state.venueCapacity}
          onCityChange={(venueCitySlug) => onChange({ venueCitySlug })}
          onAddressChange={(venueAddress) => onChange({ venueAddress })}
          onCapacityChange={(venueCapacity) => onChange({ venueCapacity })}
        />
      )}

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
            onClick={addLineupEntry}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add artist
          </button>
        </div>

        {state.lineup.map((entry, index) => (
          <div key={entry.key} className="flex items-start gap-3">
            <div className="flex-1">
              <EntityTypeahead
                id={`lineup-${index}`}
                label={index === 0 ? "Artist" : `Artist ${index + 1}`}
                placeholder="Start typing an artist name"
                options={artistOptions}
                value={entry.name}
                selectedSlug={entry.slug}
                onValueChange={(name) =>
                  updateLineup(entry.key, { name, slug: "" })
                }
                onSelect={(option) => {
                  if (option) {
                    updateLineup(entry.key, {
                      name: option.label,
                      slug: option.slug,
                    });
                  } else {
                    updateLineup(entry.key, { slug: "" });
                  }
                }}
              />
            </div>
            {state.lineup.length > 1 && (
              <button
                type="button"
                onClick={() => removeLineupEntry(entry.key)}
                className="mt-8 rounded-full border border-border p-2 text-muted hover:text-foreground"
                aria-label="Remove artist"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
