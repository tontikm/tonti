-- Phase 2: restrict orders/tickets reads to the owning fan account.
-- Server routes use the service role and are unaffected.

drop policy if exists "public read orders" on orders;
drop policy if exists "public read tickets" on tickets;

create policy "users read own orders"
  on orders for select
  using (
    auth.uid() is not null
    and (
      user_id = auth.uid()
      or lower(buyer_email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "users read own tickets"
  on tickets for select
  using (
    auth.uid() is not null
    and order_id in (
      select id
      from orders
      where user_id = auth.uid()
        or lower(buyer_email) = lower(auth.jwt() ->> 'email')
    )
  );
