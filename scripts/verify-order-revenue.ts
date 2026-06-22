/**
 * Quick sanity checks for order revenue math.
 * Run: npx tsx scripts/verify-order-revenue.ts
 */
import {
  collectedAmount,
  organizerNetFromOrder,
  revenueFromDbRow,
} from "../lib/payments/order-revenue";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exit(1);
  }
  console.log("OK:", message);
}

// No promo: subtotal === total
{
  const row = revenueFromDbRow({
    subtotal_amount: 250,
    total_amount: 250,
    service_fee: 7.5,
  });
  assert(row.collected === 250, "full price collected");
  assert(row.organizerNet === 242.5, "organizer net without promo");
}

// Promo: fan pays less, fee on discounted total
{
  const row = revenueFromDbRow({
    subtotal_amount: 250,
    total_amount: 200,
    service_fee: 6,
  });
  assert(row.collected === 200, "promo uses total_amount as collected");
  assert(row.organizerNet === 194, "organizer net after promo and fee");
  assert(
    organizerNetFromOrder({
      subtotalAmount: 250,
      totalAmount: 200,
      serviceFee: 6,
    }) === 194,
    "organizerNetFromOrder matches",
  );
}

// Free order
{
  assert(
    collectedAmount({ subtotalAmount: 0, totalAmount: 0 }) === 0,
    "free order collected is zero",
  );
}

console.log("\nAll order revenue checks passed.");
