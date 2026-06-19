-- Event organizer branding shown in the site header on event pages.
alter table events
  add column if not exists organizer_name text,
  add column if not exists organizer_logo text;
