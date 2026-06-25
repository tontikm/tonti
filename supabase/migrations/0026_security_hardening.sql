-- Pre-launch security: tighter RLS, transactional fulfillment, rate limits.

-- ---------------------------------------------------------------------------
-- Public event visibility (bypasses organizers RLS via security definer)
-- ---------------------------------------------------------------------------

create or replace function public.is_event_public(p_event_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from events e
    where e.slug = p_event_slug
      and e.publication_status = 'approved'
      and (
        e.organizer_id is null
        or exists (
          select 1
          from organizers o
          where o.id = e.organizer_id
            and o.status = 'approved'
        )
      )
  );
$$;

drop policy if exists "public read events" on events;

create policy "public read visible events"
  on events for select
  using (public.is_event_public(slug));

drop policy if exists "public read ticket_tiers" on ticket_tiers;

create policy "public read ticket_tiers for visible events"
  on ticket_tiers for select
  using (public.is_event_public(event_slug));

drop policy if exists "public read event_artists" on event_artists;

create policy "public read event_artists for visible events"
  on event_artists for select
  using (public.is_event_public(event_slug));

-- ---------------------------------------------------------------------------
-- Promo codes: no public enumeration (checkout validates server-side)
-- ---------------------------------------------------------------------------

drop policy if exists "public read promo_codes" on promo_codes;

-- ---------------------------------------------------------------------------
-- Homepage carousel
-- ---------------------------------------------------------------------------

alter table homepage_carousel_slides enable row level security;

drop policy if exists "public read active carousel slides" on homepage_carousel_slides;

create policy "public read active carousel slides"
  on homepage_carousel_slides for select
  using (active = true);

-- ---------------------------------------------------------------------------
-- Rate limiting (service role only; no public policies)
-- ---------------------------------------------------------------------------

create table if not exists rate_limit_events (
  id bigserial primary key,
  bucket text not null,
  key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_bucket_key_created_idx
  on rate_limit_events (bucket, key, created_at desc);

alter table rate_limit_events enable row level security;

create or replace function public.check_rate_limit(
  p_bucket text,
  p_key text,
  p_max_attempts integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  attempt_count integer;
  window_interval interval;
begin
  window_interval := make_interval(secs => greatest(p_window_seconds, 1));

  delete from rate_limit_events
  where bucket = p_bucket
    and created_at < now() - window_interval * 2;

  select count(*)::integer into attempt_count
  from rate_limit_events
  where bucket = p_bucket
    and key = p_key
    and created_at > now() - window_interval;

  if attempt_count >= greatest(p_max_attempts, 1) then
    return false;
  end if;

  insert into rate_limit_events (bucket, key) values (p_bucket, p_key);
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Transactional ticket fulfillment (prevents oversell under concurrency)
-- ---------------------------------------------------------------------------

create or replace function public.fulfill_ticket_order(
  p_order_id uuid,
  p_event_slug text,
  p_buyer_name text,
  p_line_items jsonb,
  p_confirm_order boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  tier_id text;
  tier_name text;
  qty integer;
  tier_rec record;
  remaining integer;
  i integer;
  code text;
  codes jsonb;
  code_count integer;
begin
  if not exists (select 1 from orders where id = p_order_id) then
    return jsonb_build_object('ok', false, 'error', 'Order not found.');
  end if;

  if p_line_items is null or jsonb_typeof(p_line_items) <> 'array' then
    return jsonb_build_object('ok', false, 'error', 'Invalid ticket selection.');
  end if;

  for item in select value from jsonb_array_elements(p_line_items)
  loop
    tier_id := item->>'tierId';
    tier_name := coalesce(item->>'tierName', '');
    qty := coalesce((item->>'qty')::integer, 0);

    if tier_id is null or qty < 1 then
      return jsonb_build_object('ok', false, 'error', 'Invalid ticket tier.');
    end if;

    select t.id, t.name, t.capacity, t.sold
    into tier_rec
    from ticket_tiers t
    where t.event_slug = p_event_slug
      and t.id = tier_id
    for update;

    if not found then
      return jsonb_build_object('ok', false, 'error', 'Invalid ticket tier.');
    end if;

    remaining := tier_rec.capacity - tier_rec.sold;
    if qty > remaining then
      return jsonb_build_object(
        'ok', false,
        'error',
        format(
          'Only %s "%s" ticket%s left.',
          remaining,
          tier_rec.name,
          case when remaining = 1 then '' else 's' end
        )
      );
    end if;

    codes := item->'codes';
    if codes is null or jsonb_typeof(codes) <> 'array' then
      return jsonb_build_object('ok', false, 'error', 'Invalid ticket codes.');
    end if;

    code_count := jsonb_array_length(codes);
    if code_count <> qty then
      return jsonb_build_object('ok', false, 'error', 'Invalid ticket codes.');
    end if;

    for i in 0..qty - 1 loop
      code := upper(trim(both from codes->>i));
      if code is null or code = '' then
        return jsonb_build_object('ok', false, 'error', 'Invalid ticket codes.');
      end if;

      insert into tickets (
        order_id,
        event_slug,
        tier_id,
        tier_name,
        code,
        holder_name
      ) values (
        p_order_id,
        p_event_slug,
        tier_id,
        coalesce(nullif(tier_name, ''), tier_rec.name),
        code,
        p_buyer_name
      );
    end loop;

    update ticket_tiers
    set sold = sold + qty
    where event_slug = p_event_slug
      and id = tier_id;
  end loop;

  if p_confirm_order then
    update orders
    set status = 'confirmed'
    where id = p_order_id;
  end if;

  return jsonb_build_object('ok', true);
exception
  when unique_violation then
    return jsonb_build_object(
      'ok', false,
      'error', 'Duplicate ticket code. Please try again.'
    );
end;
$$;
