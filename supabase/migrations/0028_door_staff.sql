-- Door staff: scan-only accounts invited per event by organizers.

create table if not exists door_staff (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text,
  name text,
  status text not null default 'invited'
    check (status in ('invited', 'active', 'suspended')),
  created_at timestamptz not null default now()
);

create index if not exists door_staff_email_idx on door_staff (email);
create index if not exists door_staff_status_idx on door_staff (status);

create table if not exists event_door_staff (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null references events (slug) on delete cascade,
  door_staff_id uuid not null references door_staff (id) on delete cascade,
  invited_by uuid references organizers (id) on delete set null,
  invite_token text unique,
  invite_expires_at timestamptz,
  status text not null default 'invited'
    check (status in ('invited', 'active', 'revoked')),
  created_at timestamptz not null default now(),
  unique (event_slug, door_staff_id)
);

create index if not exists event_door_staff_event_slug_idx on event_door_staff (event_slug);
create index if not exists event_door_staff_door_staff_id_idx on event_door_staff (door_staff_id);
create index if not exists event_door_staff_invite_token_idx on event_door_staff (invite_token);

alter table door_staff enable row level security;
alter table event_door_staff enable row level security;

-- No public policies; server uses service role only.
