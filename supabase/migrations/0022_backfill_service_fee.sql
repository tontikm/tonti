-- Backfill platform fee on legacy confirmed paid orders where service_fee was never set.

update orders
set service_fee = round(
  coalesce(nullif(total_amount, 0), subtotal_amount, 0) * 0.03,
  2
)
where status = 'confirmed'
  and coalesce(nullif(total_amount, 0), subtotal_amount, 0) > 0
  and service_fee = 0;
