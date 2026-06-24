"use client";

import { useMemo, useState } from "react";
import type { Artist, EventCategory, Venue } from "@/lib/types";
import { EVENT_CATEGORIES } from "@/lib/data/categories";
import { getGenreLabel } from "@/lib/data/genres";
import { EventDateTimeFields } from "@/components/organizer/EventDateTimeFields";
import { EntityTypeahead } from "@/components/organizer/EntityTypeahead";
import {
  ArtistLineupPicker,
  type ArtistPickerOption,
} from "@/components/organizer/ArtistLineupPicker";
import { NewVenueFields } from "@/components/organizer/NewVenueFields";
import { inputClass, labelClass } from "./shared";
import type { EventWizardState } from "./types";

type StepScheduleProps = {
  state: EventWizardState;
  venues: Venue[];
  artists: Artist[];
  onChange: (patch: Partial<EventWizardState>) => void;
};

function toArtistOptions(artists: Artist[]): ArtistPickerOption[] {
  return artists.map((artist) => ({
    slug: artist.slug,
    label: artist.name,
    sublabel: getGenreLabel(artist.genre),
  }));
}

export function StepSchedule({
  state,
  venues,
  artists,
  onChange,
}: StepScheduleProps) {
  const [artistOptions, setArtistOptions] = useState<ArtistPickerOption[]>(() =>
    toArtistOptions(artists),
  );

  const venueOptions = venues.map((venue) => ({
    slug: venue.slug,
    label: venue.name,
    sublabel: `${venue.city}, ${venue.province}`,
  }));

  const selectedLineup = useMemo(
    () =>
      state.lineup
        .filter((entry) => entry.slug && entry.name.trim())
        .map((entry) => ({ slug: entry.slug, name: entry.name })),
    [state.lineup],
  );

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

      <ArtistLineupPicker
        artists={artistOptions}
        selected={selectedLineup}
        onSelectedChange={(next) =>
          onChange({
            lineup: next.map((item, index) => ({
              key: `${item.slug}-${index}`,
              name: item.name,
              slug: item.slug,
            })),
          })
        }
        onArtistsChange={setArtistOptions}
      />
    </section>
  );
}
