-- Optional upper bound for event age restrictions (minimum stays in age_limit).
alter table events
  add column if not exists age_max integer;
