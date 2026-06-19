-- Payment tracking for paid ticket orders (Payfast and future providers).

alter table orders
  add column if not exists payment_provider text,
  add column if not exists payment_reference text,
  add column if not exists selections jsonb;

-- status values: pending_payment | confirmed | cancelled | failed

create index if not exists orders_status_idx on orders (status);
create index if not exists orders_payment_ref_idx on orders (payment_reference);
