-- Rotating QR: per-ticket TOTP secrets for SafeTix-style entry codes.

alter table tickets
  add column if not exists totp_secret text;

-- Backfill existing tickets (base64-encoded 20-byte secrets for otplib).
update tickets
set totp_secret = encode(gen_random_bytes(20), 'base64')
where totp_secret is null;

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
  totp_secret text;
  codes jsonb;
  secrets jsonb;
  code_count integer;
  secret_count integer;
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

    secrets := item->'secrets';
    if secrets is null or jsonb_typeof(secrets) <> 'array' then
      return jsonb_build_object('ok', false, 'error', 'Invalid ticket secrets.');
    end if;

    secret_count := jsonb_array_length(secrets);
    if secret_count <> qty then
      return jsonb_build_object('ok', false, 'error', 'Invalid ticket secrets.');
    end if;

    for i in 0..qty - 1 loop
      code := upper(trim(both from codes->>i));
      totp_secret := trim(both from secrets->>i);
      if code is null or code = '' then
        return jsonb_build_object('ok', false, 'error', 'Invalid ticket codes.');
      end if;
      if totp_secret is null or totp_secret = '' then
        return jsonb_build_object('ok', false, 'error', 'Invalid ticket secrets.');
      end if;

      insert into tickets (
        order_id,
        event_slug,
        tier_id,
        tier_name,
        code,
        holder_name,
        totp_secret
      ) values (
        p_order_id,
        p_event_slug,
        tier_id,
        coalesce(nullif(tier_name, ''), tier_rec.name),
        code,
        p_buyer_name,
        totp_secret
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
