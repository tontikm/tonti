-- Tonti core schema: events and their related artists, venues, and tiers.
-- Cities and genres remain static UI config in the app (they carry images and
-- colours), so they are intentionally not tables here.

create table if not exists artists (
  slug text primary key,
  name text not null,
  genre text not null,
  image text not null,
  bio text
);

create table if not exists venues (
  slug text primary key,
  name text not null,
  city text not null,
  province text not null,
  address text not null,
  capacity integer not null default 0,
  image text not null
);

create table if not exists events (
  slug text primary key,
  title text not null,
  subtitle text,
  description text not null,
  image text not null,
  date timestamptz not null,
  end_date timestamptz,
  doors_time timestamptz not null,
  show_time timestamptz not null,
  genre text not null,
  featured boolean not null default false,
  venue_slug text not null references venues (slug) on delete restrict,
  age_limit integer,
  tags text[] not null default '{}'
);

create table if not exists ticket_tiers (
  event_slug text not null references events (slug) on delete cascade,
  id text not null,
  name text not null,
  price numeric not null default 0,
  description text,
  capacity integer not null default 0,
  sold integer not null default 0,
  position integer not null default 0,
  primary key (event_slug, id)
);

create table if not exists event_artists (
  event_slug text not null references events (slug) on delete cascade,
  artist_slug text not null references artists (slug) on delete cascade,
  position integer not null default 0,
  primary key (event_slug, artist_slug)
);

create index if not exists events_genre_idx on events (genre);
create index if not exists events_date_idx on events (date);
create index if not exists events_venue_idx on events (venue_slug);

-- Public read access; writes happen via the service role (e.g. Table Editor).
alter table artists enable row level security;
alter table venues enable row level security;
alter table events enable row level security;
alter table ticket_tiers enable row level security;
alter table event_artists enable row level security;

create policy "public read artists" on artists for select using (true);
create policy "public read venues" on venues for select using (true);
create policy "public read events" on events for select using (true);
create policy "public read ticket_tiers" on ticket_tiers for select using (true);
create policy "public read event_artists" on event_artists for select using (true);
