/** Revenue breakdown for a single order row or amounts object. */

export type OrderRevenueInput = {
  subtotalAmount: number;
  totalAmount: number;
  serviceFee: number;
};

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Amount fans actually paid (after promo discounts). */
export function collectedAmount(
  amounts: Pick<OrderRevenueInput, "subtotalAmount" | "totalAmount">,
): number {
  const total = Number(amounts.totalAmount ?? 0);
  const subtotal = Number(amounts.subtotalAmount ?? 0);
  if (total > 0) return roundCurrency(total);
  return roundCurrency(subtotal);
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
  const collected = collectedAmount(amounts);
  const fee = Number(amounts.serviceFee ?? 0);
  return roundCurrency(Math.max(0, collected - fee));
}

export function revenueFromDbRow(row: {
  subtotal_amount?: unknown;
  total_amount?: unknown;
  service_fee?: unknown;
}): OrderRevenueInput & {
  collected: number;
  organizerNet: number;
} {
  const totalAmount = Number(row.total_amount ?? 0);
  const subtotalAmount = Number(row.subtotal_amount ?? totalAmount);
  const serviceFee = Number(row.service_fee ?? 0);
  const amounts: OrderRevenueInput = {
    subtotalAmount,
    totalAmount,
    serviceFee,
  };
  return {
    ...amounts,
    collected: collectedAmount(amounts),
    organizerNet: organizerNetFromOrder(amounts),
  };
}
