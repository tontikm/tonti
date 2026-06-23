"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { slugify } from "@/lib/utils";
import { BRAND_DOMAIN } from "@/lib/site";
import { inputClass, labelClass } from "./shared";
import type { EventWizardState } from "./types";

type StepBasicsProps = {
  state: EventWizardState;
  onChange: (patch: Partial<EventWizardState>) => void;
};

export function StepBasics({ state, onChange }: StepBasicsProps) {
  useEffect(() => {
    return () => {
      if (state.posterPreview) URL.revokeObjectURL(state.posterPreview);
    };
  }, [state.posterPreview]);

  function onTitleChange(value: string) {
    const patch: Partial<EventWizardState> = { title: value };
    if (!state.slugEdited) patch.slug = slugify(value);
    onChange(patch);
  }

  function onPosterChange(file: File | undefined) {
    if (state.posterPreview) URL.revokeObjectURL(state.posterPreview);
    if (!file) {
      onChange({ posterFile: null, posterPreview: null });
      return;
    }
    onChange({
      posterFile: file,
      posterPreview: URL.createObjectURL(file),
    });
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Event details</h2>

      <div>
        <label htmlFor="title" className={labelClass}>
          Event title *
        </label>
        <input
          id="title"
          required
          value={state.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={inputClass}
          placeholder="Amapiano Festival"
        />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          URL slug *
        </label>
        <input
          id="slug"
          required
          value={state.slug}
          onChange={(e) =>
            onChange({ slug: e.target.value, slugEdited: true })
          }
          className={inputClass}
          placeholder="amapiano-festival-jhb"
        />
        <p className="mt-1 text-xs text-muted">
          {BRAND_DOMAIN}/events/{state.slug || "your-event-slug"}
        </p>
      </div>

      <div>
        <label htmlFor="subtitle" className={labelClass}>
          Subtitle
        </label>
        <input
          id="subtitle"
          value={state.subtitle}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          className={inputClass}
          placeholder="Two days of log-drum heaven"
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description *
        </label>
        <textarea
          id="description"
          required
          rows={5}
          value={state.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className={inputClass}
          placeholder="Tell fans what to expect…"
        />
      </div>

      <div>
        <label htmlFor="poster" className={labelClass}>
          Event poster *
        </label>
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-4">
          {state.posterPreview ? (
            <div className="relative mb-4 aspect-[16/9] max-h-56 overflow-hidden rounded-xl border border-border">
              <Image
                src={state.posterPreview}
                alt="Poster preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="mb-4 flex aspect-[16/9] max-h-56 items-center justify-center rounded-xl border border-border bg-surface text-muted">
              <div className="text-center">
                <ImagePlus className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm">Upload a poster image</p>
              </div>
            </div>
          )}
          <input
            id="poster"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => onPosterChange(e.target.files?.[0])}
            className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-foreground hover:file:bg-accent-hover"
          />
          <p className="mt-2 text-xs text-muted">
            JPG, PNG, WebP, or GIF · max 5 MB
          </p>
        </div>
      </div>
    </section>
  );
}
