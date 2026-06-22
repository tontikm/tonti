-- Platform admin accounts (separate from organizers).

create table if not exists platform_admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text,
  created_at timestamptz not null default now()
);

create index if not exists platform_admins_email_idx on platform_admins (email);

alter table platform_admins enable row level security;

-- No public policies; server uses service role only.
