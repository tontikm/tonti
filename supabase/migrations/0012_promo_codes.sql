-- Promo codes for event ticket discounts (applied before platform fee).

create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null references events (slug) on delete cascade,
  code text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  max_uses integer,
  uses_count integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (event_slug, code)
);

create index if not exists promo_codes_event_idx on promo_codes (event_slug);

alter table orders
  add column if not exists promo_code_id uuid references promo_codes (id) on delete set null,
  add column if not exists discount_amount numeric not null default 0;

alter table promo_codes enable row level security;

create policy "public read promo_codes" on promo_codes for select using (true);
