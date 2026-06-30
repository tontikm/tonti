/**
 * Quick sanity checks for order revenue math.
 * Run: npx tsx scripts/verify-order-revenue.ts
 */
import { computeOrderAmounts } from "../lib/payments/service-fee";
import {
  collectedAmount,
  organizerNetFromOrder,
  revenueFromDbRow,
  ticketAmountCollected,
} from "../lib/payments/order-revenue";
import { computeProcessingFee } from "../lib/payments/processing-fees";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exit(1);
  }
  console.log("OK:", message);
}

// R500 ticket + booking fee
{
  const amounts = computeOrderAmounts(
    [{ price: 500, quantity: 1 }],
    1,
  );
  assert(amounts.bookingFee === 6, "R6 booking fee per ticket");
  assert(amounts.serviceFee === 17.5, "3.5% organiser fee on R500");
  assert(amounts.totalAmount === 506, "buyer pays R506");

  const row = revenueFromDbRow({
    subtotal_amount: 500,
    total_amount: 506,
    service_fee: 17.5,
    booking_fee: 6,
  });
  assert(row.collected === 506, "fan total includes booking fee");
  assert(row.ticketAmount === 500, "ticket amount excludes booking fee");
  assert(row.organizerNet === 482.5, "organizer net after platform fee");
}

// Promo: fee on discounted ticket amount; booking fee still applies
{
  const row = revenueFromDbRow({
    subtotal_amount: 250,
    total_amount: 206,
    discount_amount: 50,
    service_fee: 7,
    booking_fee: 6,
  });
  assert(row.ticketAmount === 200, "ticket amount after promo");
  assert(row.collected === 206, "promo total includes booking fee");
  assert(row.organizerNet === 193, "organizer net after promo and fee");
  assert(
    organizerNetFromOrder({
      subtotalAmount: 250,
      totalAmount: 206,
      serviceFee: 7,
      bookingFee: 6,
      discountAmount: 50,
    }) === 193,
    "organizerNetFromOrder matches",
  );
  assert(
    ticketAmountCollected({
      subtotalAmount: 250,
      totalAmount: 206,
      bookingFee: 6,
      discountAmount: 50,
    }) === 200,
    "ticketAmountCollected excludes booking fee",
  );
}

// Free order
{
  assert(
    collectedAmount({ subtotalAmount: 0, totalAmount: 0 }) === 0,
    "free order collected is zero",
  );
}

// Processing fees (Spotra-absorbed)
{
  assert(
    computeProcessingFee(506, "eft") === 10.12,
    "EFT processing fee is 2% of transaction",
  );
  assert(
    computeProcessingFee(506, "card") > 20,
    "card processing fee includes flat + percentage",
  );
}

console.log("\nAll order revenue checks passed.");
