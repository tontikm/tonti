-- Organizer approval workflow for platform moderation.

alter table organizers
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved', 'suspended'));

-- Grandfather existing accounts as approved.
update organizers set status = 'approved' where status = 'pending';

create index if not exists organizers_status_idx on organizers (status);
