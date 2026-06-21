-- Platform fee tracking (3% on paid tickets; organizer-absorbed).

alter table orders
  add column if not exists subtotal_amount numeric,
  add column if not exists service_fee numeric not null default 0;

update orders
set subtotal_amount = total_amount
where subtotal_amount is null;
