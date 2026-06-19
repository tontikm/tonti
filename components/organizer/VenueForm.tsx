"use client";

import { useActionState, useState } from "react";
import { getCitiesGroupedByProvince } from "@/lib/data/cities";
import { createVenue, type ActionState } from "@/app/organizer/actions";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export function VenueForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createVenue,
    {},
  );
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function onNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  const cityGroups = getCitiesGroupedByProvince();

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {state.error && (
        <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          Venue name *
        </label>
        <input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={inputClass}
          placeholder="The Zone @ Rosebank"
        />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          URL slug *
        </label>
        <input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugEdited(true);
            setSlug(e.target.value);
          }}
          className={inputClass}
          placeholder="zone-rosebank"
        />
      </div>

      <div>
        <label htmlFor="citySlug" className={labelClass}>
          City *
        </label>
        <select id="citySlug" name="citySlug" required className={inputClass}>
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
        <label htmlFor="address" className={labelClass}>
          Address *
        </label>
        <input
          id="address"
          name="address"
          required
          className={inputClass}
          placeholder="Street address"
        />
      </div>

      <div>
        <label htmlFor="capacity" className={labelClass}>
          Capacity *
        </label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          required
          defaultValue={500}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="image" className={labelClass}>
          Image URL
        </label>
        <input
          id="image"
          name="image"
          type="url"
          className={inputClass}
          placeholder="https://images.unsplash.com/…"
        />
        <p className="mt-1 text-xs text-muted">
          Optional — defaults to a stock photo if left blank
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add venue"}
        </Button>
        <Button href="/organizer/venues" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
