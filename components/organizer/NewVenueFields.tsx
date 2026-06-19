"use client";

import { getCitiesGroupedByProvince } from "@/lib/data/cities";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none";

type NewVenueFieldsProps = {
  citySlug: string;
  address: string;
  capacity: string;
  onCityChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCapacityChange: (value: string) => void;
};

export function NewVenueFields({
  citySlug,
  address,
  capacity,
  onCityChange,
  onAddressChange,
  onCapacityChange,
}: NewVenueFieldsProps) {
  const cityGroups = getCitiesGroupedByProvince();

  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-4">
      <p className="text-sm font-medium text-foreground">New venue details</p>
      <p className="mt-1 text-xs text-muted">
        This venue will be saved automatically when you publish the event.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="venueCitySlug" className="mb-1.5 block text-sm font-medium">
            City *
          </label>
          <select
            id="venueCitySlug"
            name="venueCitySlug"
            required
            value={citySlug}
            onChange={(event) => onCityChange(event.target.value)}
            className={inputClass}
          >
            <option value="">Select city</option>
            {cityGroups.map((group) => (
              <optgroup key={group.province} label={group.province}>
                {group.cities.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="venueCapacity" className="mb-1.5 block text-sm font-medium">
            Capacity
          </label>
          <input
            id="venueCapacity"
            name="venueCapacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(event) => onCapacityChange(event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="venueAddress" className="mb-1.5 block text-sm font-medium">
            Address
          </label>
          <input
            id="venueAddress"
            name="venueAddress"
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            className={inputClass}
            placeholder="Street address (optional)"
          />
        </div>
      </div>
    </div>
  );
}
