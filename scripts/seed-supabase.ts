/**
 * Seeds a Supabase project with the local Spotra seed data.
 *
 * Usage:
 *   1. Create a Supabase project and run supabase/migrations/0001_init.sql
 *   2. Put NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. Run: npx tsx --env-file=.env.local scripts/seed-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import { EVENTS } from "../lib/data/events";
import { ARTISTS } from "../lib/data/artists";
import { VENUES } from "../lib/data/venues";
import {
  REMOVED_DEMO_ARTIST_SLUGS,
  REMOVED_DEMO_EVENT_SLUGS,
} from "../lib/data/seed-demo";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Set them in .env.local and run with --env-file=.env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function pruneRemovedSeedData() {
  console.log("Removing deprecated demo events and artists…");
  let res = await supabase
    .from("events")
    .delete()
    .in("slug", [...REMOVED_DEMO_EVENT_SLUGS]);
  if (res.error) throw res.error;
  res = await supabase
    .from("artists")
    .delete()
    .in("slug", [...REMOVED_DEMO_ARTIST_SLUGS]);
  if (res.error) throw res.error;
}

async function seed() {
  await pruneRemovedSeedData();
  console.log(`Seeding ${ARTISTS.length} artists…`);
  const artistRows = ARTISTS.map((a) => ({
    slug: a.slug,
    name: a.name,
    genre: a.genre,
    image: a.image,
    bio: a.bio ?? null,
  }));
  let res = await supabase.from("artists").upsert(artistRows);
  if (res.error) throw res.error;

  console.log(`Seeding ${VENUES.length} venues…`);
  const venueRows = VENUES.map((v) => ({
    slug: v.slug,
    name: v.name,
    city: v.city,
    province: v.province,
    address: v.address,
    capacity: v.capacity,
    image: v.image,
  }));
  res = await supabase.from("venues").upsert(venueRows);
  if (res.error) throw res.error;

  console.log(`Seeding ${EVENTS.length} events…`);
  const eventRows = EVENTS.map((e) => ({
    slug: e.slug,
    title: e.title,
    subtitle: e.subtitle ?? null,
    description: e.description,
    image: e.image,
    hero_image: null,
    date: e.date,
    end_date: e.endDate ?? null,
    doors_time: e.doorsTime,
    show_time: e.showTime,
    genre: e.category,
    featured: e.featured,
    venue_slug: e.venue.slug,
    age_limit: e.ageLimit ?? null,
    age_max: e.ageMax ?? null,
    tags: e.tags,
    organizer_name: e.organizerName ?? null,
    organizer_logo: e.organizerLogo ?? null,
  }));
  res = await supabase.from("events").upsert(eventRows);
  if (res.error) throw res.error;

  const tierRows = EVENTS.flatMap((e) =>
    e.tiers.map((t, index) => ({
      event_slug: e.slug,
      id: t.id,
      name: t.name,
      price: t.price,
      description: t.description ?? null,
      capacity: t.capacity,
      sold: t.sold,
      position: index,
    })),
  );
  console.log(`Seeding ${tierRows.length} ticket tiers…`);
  res = await supabase.from("ticket_tiers").upsert(tierRows);
  if (res.error) throw res.error;

  const eventArtistRows = EVENTS.flatMap((e) =>
    e.artists.map((a, index) => ({
      event_slug: e.slug,
      artist_slug: a.slug,
      position: index,
    })),
  );
  console.log(`Seeding ${eventArtistRows.length} event-artist links…`);
  res = await supabase.from("event_artists").upsert(eventArtistRows);
  if (res.error) throw res.error;

  console.log("Done. Spotra data is now in Supabase.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
