-- Orders and individual tickets for free RSVP + QR check-in.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null references events (slug) on delete cascade,
  buyer_name text not null,
  buyer_email text not null,
  total_amount numeric not null default 0,
  ticket_count integer not null default 0,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  event_slug text not null references events (slug) on delete cascade,
  tier_id text not null,
  tier_name text not null,
  code text not null unique,
  holder_name text not null,
  status text not null default 'valid',
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (event_slug, tier_id) references ticket_tiers (event_slug, id) on delete restrict
);

create index if not exists orders_event_idx on orders (event_slug);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists tickets_order_idx on tickets (order_id);
create index if not exists tickets_code_idx on tickets (code);
create index if not exists tickets_event_idx on tickets (event_slug);

alter table orders enable row level security;
alter table tickets enable row level security;

create policy "public read orders" on orders for select using (true);
create policy "public read tickets" on tickets for select using (true);
