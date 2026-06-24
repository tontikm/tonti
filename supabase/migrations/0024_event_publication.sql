-- Per-event moderation: organizers submit events; admins approve before they go live.

alter table events
  add column if not exists publication_status text not null default 'pending'
    check (publication_status in ('pending', 'approved', 'rejected'));

-- Existing events stay live.
update events set publication_status = 'approved' where publication_status = 'pending';

create index if not exists events_publication_status_idx on events (publication_status);
