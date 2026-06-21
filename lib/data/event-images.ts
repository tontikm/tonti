/** Curated Unsplash posters for seed events — one unique image per slug. */
const POSTER = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

export const EVENT_IMAGES = {
  "amapiano-festival-jhb": POSTER("1533174072545-7a4b6ad7a6c3"),
  "tonti-sessions-free-fridays": POSTER("1511671782779-c97d3d27a1d4"),
  "nomvula-kirstenbosch": POSTER("1470229722913-7c0e2dbbafd3"),
  "deep-sankomota-grandwest": POSTER("1571330735066-03aaa9429da7"),
  "durban-bass-union-icc": POSTER("1598387846159-10d43b52b2af"),
  "k1ng-verse-sun-arena": POSTER("1501281668745-f7f57925c3b4"),
  "township-funk-con-hill": POSTER("1514525253440-b593422f2274"),
  "lerato-sky-durban": POSTER("1540039155733-c5bc69f8ae64"),
  "cape-town-quartet-stellenbosch": POSTER("1511192336575-5a79af67a629"),
  "veld-riders-gqeberha": POSTER("1510915361894-db8b60106cb1"),
  "naledi-pop-sun-arena": POSTER("1516450360452-9312f5e86fc7"),
} as const satisfies Record<string, string>;

export type SeedEventSlug = keyof typeof EVENT_IMAGES;
