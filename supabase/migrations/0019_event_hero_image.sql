-- Optional wide homepage carousel banner (separate from event poster).
alter table events
  add column if not exists hero_image text;
