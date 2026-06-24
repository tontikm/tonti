"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  createAdminArtist,
  updateAdminArtist,
  type AdminActionState,
} from "@/app/admin/actions";
import type { AdminArtistRow } from "@/lib/admin/data";
import { GENRES } from "@/lib/data/genres";
import { getSafeArtistImageUrl } from "@/lib/images";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-white/40 focus:outline-none";

type AdminArtistFormProps = {
  mode: "create" | "edit";
  artist?: AdminArtistRow;
};

export function AdminArtistForm({ mode, artist }: AdminArtistFormProps) {
  const action =
    mode === "create"
      ? createAdminArtist
      : updateAdminArtist.bind(null, artist!.slug);

  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(
    action,
    {},
  );

  const [name, setName] = useState(artist?.name ?? "");
  const [slug, setSlug] = useState(artist?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [preview, setPreview] = useState(
    artist ? getSafeArtistImageUrl(artist.image) : null,
  );

  function onNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">
          {state.success}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Artist name *
        </label>
        <input
          id="name"
          name="name"
          required
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">
          URL slug *
        </label>
        <input
          id="slug"
          name="slug"
          required
          readOnly={mode === "edit"}
          value={slug}
          onChange={(event) => {
            setSlugEdited(true);
            setSlug(event.target.value);
          }}
          className={`${inputClass} ${mode === "edit" ? "opacity-70" : ""}`}
        />
      </div>

      <div>
        <label htmlFor="genre" className="mb-1.5 block text-sm font-medium">
          Genre *
        </label>
        <select
          id="genre"
          name="genre"
          required
          defaultValue={artist?.genre ?? ""}
          className={inputClass}
        >
          <option value="">Select genre</option>
          {GENRES.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
          Bio / description
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          defaultValue={artist?.bio ?? ""}
          className={inputClass}
          placeholder="Artist bio shown on their public profile page"
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-medium">Profile image</p>
        {preview && (
          <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-white/10">
            <Image
              src={preview}
              alt=""
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        )}
        <div>
          <label htmlFor="imageFile" className="mb-1.5 block text-sm font-medium">
            Upload image
          </label>
          <input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-foreground"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
        <div>
          <label htmlFor="imageUrl" className="mb-1.5 block text-sm font-medium">
            Or image URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            className={inputClass}
            placeholder="https://…"
          />
        </div>
        {mode === "edit" && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="clearImage" className="rounded" />
            Reset to default stock image
          </label>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Add artist" : "Save changes"}
        </Button>
        <Button href="/admin/artists" variant="secondary">
          Cancel
        </Button>
        {mode === "edit" && artist && (
          <Link
            href={`/artists/${artist.slug}`}
            className="inline-flex items-center self-center text-sm text-muted hover:text-foreground"
          >
            View public page →
          </Link>
        )}
      </div>
    </form>
  );
}
