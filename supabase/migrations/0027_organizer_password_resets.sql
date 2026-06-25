-- One-time tokens for organizer password reset emails.

create table if not exists organizer_password_resets (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references organizers (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists organizer_password_resets_organizer_id_idx
  on organizer_password_resets (organizer_id);

create index if not exists organizer_password_resets_expires_at_idx
  on organizer_password_resets (expires_at);

alter table organizer_password_resets enable row level security;
