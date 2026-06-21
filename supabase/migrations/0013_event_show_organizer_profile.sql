-- Let organizers opt in to showing their public profile on an event page.
alter table events
  add column if not exists show_organizer_profile boolean not null default false;
