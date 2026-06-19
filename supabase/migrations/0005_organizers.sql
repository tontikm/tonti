-- Organizer accounts with password auth.

create table if not exists organizers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text,
  created_at timestamptz not null default now()
);

create index if not exists organizers_email_idx on organizers (email);

alter table organizers enable row level security;

-- No public policies; server uses service role only.
