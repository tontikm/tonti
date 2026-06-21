-- Fan event follows (saved events on profile).

create table if not exists event_follows (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_slug text not null references events (slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_slug)
);

create index if not exists event_follows_user_idx on event_follows (user_id);
create index if not exists event_follows_event_idx on event_follows (event_slug);

alter table event_follows enable row level security;

create policy "users read own follows"
  on event_follows for select
  using (auth.uid() = user_id);

create policy "users insert own follows"
  on event_follows for insert
  with check (auth.uid() = user_id);

create policy "users delete own follows"
  on event_follows for delete
  using (auth.uid() = user_id);
