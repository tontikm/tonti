-- Link ticket orders to fan accounts (Supabase Auth users).

alter table orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_user_id_idx on orders (user_id);
create index if not exists orders_buyer_email_idx on orders (buyer_email);
