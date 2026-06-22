"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";

type HeroBannerFieldProps = {
  previewUrl: string | null;
  onFileChange: (file: File | undefined) => void;
};

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export function HeroBannerField({
  previewUrl,
  onFileChange,
}: HeroBannerFieldProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <label htmlFor="heroBanner" className={labelClass}>
        Homepage hero banner (optional)
      </label>
      <p className="mb-3 text-xs text-muted">
        Wide landscape image recommended — 16:9 (e.g. 1920×1080). Used
        full-bleed on the homepage carousel. Your poster is still used on the
        event page.
      </p>
      {previewUrl ? (
        <div className="relative mb-4 aspect-video max-h-48 overflow-hidden rounded-xl border border-border">
          <Image
            src={previewUrl}
            alt=""
            fill
            className="object-cover"
            sizes="400px"
            unoptimized={previewUrl.startsWith("blob:")}
          />
        </div>
      ) : (
        <div className="mb-4 flex aspect-video max-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-surface text-muted">
          <div className="text-center">
            <ImagePlus className="mx-auto h-8 w-8 opacity-50" />
            <p className="mt-2 text-sm">Upload a wide hero image</p>
          </div>
        </div>
      )}
      <input
        id="heroBanner"
        name="heroBanner"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => onFileChange(e.target.files?.[0])}
        className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-foreground hover:file:bg-white/15"
      />
    </div>
  );
}
