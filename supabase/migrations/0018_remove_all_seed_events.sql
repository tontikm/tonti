-- Remove all remaining fictional seed demo events and artists.

delete from events
where slug in (
  'amapiano-festival-jhb',
  'tonti-sessions-free-fridays',
  'nomvula-kirstenbosch',
  'k1ng-verse-sun-arena',
  'cape-town-quartet-stellenbosch',
  'veld-riders-gqeberha',
  'naledi-pop-sun-arena'
);

delete from artists
where slug in (
  'piano-republic',
  'nomvula',
  'k1ng-verse',
  'cape-town-quartet',
  'veld-riders',
  'naledi'
);
