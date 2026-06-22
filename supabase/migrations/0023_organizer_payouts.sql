-- Track manual EFT payouts to organizers.

create table if not exists organizer_payouts (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references organizers (id) on delete cascade,
  amount numeric not null check (amount > 0),
  paid_at timestamptz not null default now(),
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists organizer_payouts_organizer_id_idx
  on organizer_payouts (organizer_id);

alter table organizer_payouts enable row level security;

-- No public policies; server uses service role only.
