import type { Artist } from "@/lib/types";

export const ARTISTS: Artist[] = [
  {
    slug: "neon-pulse",
    name: "Neon Pulse",
    genre: "electronic",
    image:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429da7?w=600&q=80",
    bio: "Berlin-born producer blending hypnotic techno with live analog synths.",
  },
  {
    slug: "maya-rivers",
    name: "Maya Rivers",
    genre: "r-and-b",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    bio: "Grammy-nominated vocalist redefining modern soul with raw, intimate performances.",
  },
  {
    slug: "the-midnight-collective",
    name: "The Midnight Collective",
    genre: "indie",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
    bio: "Dream-pop quartet from Portland with shimmering guitars and cinematic arrangements.",
  },
  {
    slug: "dj-kairo",
    name: "DJ Kairo",
    genre: "hip-hop",
    image:
      "https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&q=80",
    bio: "Underground hip-hop curator and turntablist known for genre-bending live sets.",
  },
  {
    slug: "solar-flare",
    name: "Solar Flare",
    genre: "rock",
    image:
      "https://images.unsplash.com/photo-1459745456775-9afc3a8049bc?w=600&q=80",
    bio: "High-energy rock trio channeling 70s arena energy with modern production.",
  },
  {
    slug: "carla-mendez",
    name: "Carla Mendez",
    genre: "latin",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    bio: "Reggaeton and Latin pop fusion artist bringing Miami heat to every stage.",
  },
  {
    slug: "blue-hour-quartet",
    name: "Blue Hour Quartet",
    genre: "jazz",
    image:
      "https://images.unsplash.com/photo-1415201364774-f6f0ff5a0287?w=600&q=80",
    bio: "Contemporary jazz ensemble inspired by Coltrane and Kamasi Washington.",
  },
  {
    slug: "dusty-trails",
    name: "Dusty Trails",
    genre: "country",
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80",
    bio: "Nashville outlaw country with honest songwriting and pedal steel.",
  },
];

export function getArtistBySlug(slug: string): Artist | undefined {
  return ARTISTS.find((a) => a.slug === slug);
}
