-- Optional buyer mobile for WhatsApp ticket delivery.

alter table orders
  add column if not exists buyer_phone text;
