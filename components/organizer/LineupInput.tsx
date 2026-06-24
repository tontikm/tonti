"use client";

import { useState } from "react";
import {
  ArtistLineupPicker,
  type ArtistPickerOption,
  type LineupSelection,
} from "@/components/organizer/ArtistLineupPicker";

type LineupInputProps = {
  artists: ArtistPickerOption[];
  initialNames?: string[];
  initialSlugs?: string[];
};

export function LineupInput({
  artists: initialArtists,
  initialNames = [],
  initialSlugs = [],
}: LineupInputProps) {
  const [artistOptions, setArtistOptions] =
    useState<ArtistPickerOption[]>(initialArtists);

  const [selected, setSelected] = useState<LineupSelection[]>(() => {
    if (initialSlugs.length === 0) return [];
    return initialSlugs
      .map((slug, index) => {
        const name =
          initialNames[index] ??
          artistOptions.find((artist) => artist.slug === slug)?.label ??
          slug;
        return slug ? { slug, name } : null;
      })
      .filter((entry): entry is LineupSelection => entry !== null);
  });

  return (
    <ArtistLineupPicker
      artists={artistOptions}
      selected={selected}
      onSelectedChange={setSelected}
      onArtistsChange={setArtistOptions}
      formMode
    />
  );
}
