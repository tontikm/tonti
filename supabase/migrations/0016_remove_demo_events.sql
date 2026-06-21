-- Remove deprecated seed demo events and their exclusive artists.

delete from events
where slug in (
  'deep-sankomota-grandwest',
  'durban-bass-union-icc',
  'township-funk-con-hill',
  'lerato-sky-durban'
);

delete from artists
where slug in (
  'deep-sankomota',
  'durban-bass-union',
  'township-funk',
  'lerato-sky'
);
