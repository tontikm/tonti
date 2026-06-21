/** Legacy seed poster URLs — demo events removed; kept for type compatibility. */
export const EVENT_IMAGES = {} as const satisfies Record<string, string>;

export type SeedEventSlug = keyof typeof EVENT_IMAGES;
