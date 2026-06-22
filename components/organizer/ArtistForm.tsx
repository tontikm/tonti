"use client";

import { useActionState, useState } from "react";
import { GENRES } from "@/lib/data/genres";
import { createArtist, type ActionState } from "@/app/organizer/actions";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export function ArtistForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createArtist,
    {},
  );
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function onNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {state.error && (
        <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          Artist name *
        </label>
        <input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={inputClass}
          placeholder="DJ Maphorisa"
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
          placeholder="dj-maphorisa"
        />
      </div>

      <div>
        <label htmlFor="genre" className={labelClass}>
          Genre *
        </label>
        <select id="genre" name="genre" required className={inputClass}>
          <option value="">Select genre</option>
          {GENRES.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bio" className={labelClass}>
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          className={inputClass}
          placeholder="Short artist bio for their profile page"
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
          Optional. Defaults to a stock photo if left blank
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add artist"}
        </Button>
        <Button href="/organizer/artists" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
