-- Admin-curated homepage carousel slides (event + custom promo slides).
create table if not exists homepage_carousel_slides (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  slide_type text not null check (slide_type in ('event', 'custom')),
  event_slug text references events(slug) on delete cascade,
  image_source text check (image_source in ('hero', 'poster', 'custom')),
  custom_image_url text,
  title text,
  subtitle text,
  link_url text,
  cta_label text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_carousel_slides_event_check check (
    slide_type <> 'event'
    or (event_slug is not null and image_source is not null)
  ),
  constraint homepage_carousel_slides_custom_check check (
    slide_type <> 'custom'
    or custom_image_url is not null
  )
);

create index if not exists homepage_carousel_slides_sort_idx
  on homepage_carousel_slides (sort_order);

create index if not exists homepage_carousel_slides_event_slug_idx
  on homepage_carousel_slides (event_slug)
  where event_slug is not null;

-- Backfill from legacy featured events (preserve date order).
insert into homepage_carousel_slides (
  sort_order,
  slide_type,
  event_slug,
  image_source,
  active
)
select
  row_number() over (order by e.date asc) - 1 as sort_order,
  'event' as slide_type,
  e.slug as event_slug,
  case
    when e.hero_image is not null and trim(e.hero_image) <> '' then 'hero'
    else 'poster'
  end as image_source,
  true as active
from events e
where e.featured = true
  and not exists (
    select 1
    from homepage_carousel_slides s
    where s.event_slug = e.slug
  );
