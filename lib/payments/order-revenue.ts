import { ORGANIZER_FEE_RATE } from "@/lib/payments/service-fee";

/** Revenue breakdown for a single order row or amounts object. */

export type OrderRevenueInput = {
  subtotalAmount: number;
  totalAmount: number;
  serviceFee: number;
  bookingFee?: number;
  discountAmount?: number;
};

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Amount fans actually paid (ticket amount + booking fee). */
export function collectedAmount(
  amounts: Pick<OrderRevenueInput, "subtotalAmount" | "totalAmount">,
): number {
  const total = Number(amounts.totalAmount ?? 0);
  const subtotal = Number(amounts.subtotalAmount ?? 0);
  if (total > 0) return roundCurrency(total);
  return roundCurrency(subtotal);
}

/** Post-discount ticket revenue (excludes booking fee). */
export function ticketAmountCollected(
  amounts: Pick<
    OrderRevenueInput,
    "subtotalAmount" | "totalAmount" | "bookingFee" | "discountAmount"
  >,
): number {
  const bookingFee = Number(amounts.bookingFee ?? 0);
  const total = Number(amounts.totalAmount ?? 0);
  if (total > 0 && bookingFee > 0) {
    return roundCurrency(Math.max(0, total - bookingFee));
  }
  const subtotal = Number(amounts.subtotalAmount ?? 0);
  const discount = Number(amounts.discountAmount ?? 0);
  if (subtotal > 0) {
    return roundCurrency(Math.max(0, subtotal - discount));
  }
  return roundCurrency(total);
}

/** Face-value subtotal before discounts (for reference). */
export function faceValueAmount(
  amounts: Pick<OrderRevenueInput, "subtotalAmount" | "totalAmount">,
): number {
  const subtotal = Number(amounts.subtotalAmount ?? 0);
  const total = Number(amounts.totalAmount ?? 0);
  if (subtotal > 0) return roundCurrency(subtotal);
  return roundCurrency(total);
}

export function organizerNetFromOrder(amounts: OrderRevenueInput): number {
  const ticketAmount = ticketAmountCollected(amounts);
  const fee = Number(amounts.serviceFee ?? 0);
  return roundCurrency(Math.max(0, ticketAmount - fee));
}

export function revenueFromDbRow(row: {
  subtotal_amount?: unknown;
  total_amount?: unknown;
  service_fee?: unknown;
  booking_fee?: unknown;
  discount_amount?: unknown;
}): OrderRevenueInput & {
  collected: number;
  ticketAmount: number;
  organizerNet: number;
} {
  const totalAmount = Number(row.total_amount ?? 0);
  const subtotalAmount = Number(row.subtotal_amount ?? totalAmount);
  const serviceFee = Number(row.service_fee ?? 0);
  const bookingFee = Number(row.booking_fee ?? 0);
  const discountAmount = Number(row.discount_amount ?? 0);
  const amounts: OrderRevenueInput = {
    subtotalAmount,
    totalAmount,
    serviceFee,
    bookingFee,
    discountAmount,
  };
  const ticketAmount = ticketAmountCollected(amounts);
  return {
    ...amounts,
    collected: collectedAmount(amounts),
    ticketAmount,
    organizerNet: organizerNetFromOrder(amounts),
  };
}

/** True when a paid order is missing the expected platform fee (legacy data). */
export function isFeeIncomplete(
  ticketAmount: number,
  platformFee: number,
): boolean {
  if (ticketAmount <= 0) return false;
  const expected = roundCurrency(ticketAmount * ORGANIZER_FEE_RATE);
  return platformFee < expected - 0.01;
}

export function expectedPlatformFee(ticketAmount: number): number {
  if (ticketAmount <= 0) return 0;
  return roundCurrency(ticketAmount * ORGANIZER_FEE_RATE);
}
