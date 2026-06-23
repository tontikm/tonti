export const SERVICE_FEE_RATE = 0.03;

export type FeeLine = {
  price: number;
  quantity: number;
};

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Sum of face-value totals for paid tiers only (price > 0). */
export function computePaidSubtotal(lines: FeeLine[]): number {
  return roundCurrency(
    lines.reduce((sum, line) => {
      if (line.price <= 0) return sum;
      return sum + line.price * line.quantity;
    }, 0),
  );
}

/** Spotra platform fee — 3% of paid subtotal. */
export function computeServiceFee(paidSubtotal: number): number {
  if (paidSubtotal <= 0) return 0;
  return roundCurrency(paidSubtotal * SERVICE_FEE_RATE);
}

/** Estimated organizer payout after platform fee. */
export function computeOrganizerNet(
  paidSubtotal: number,
  serviceFee: number,
): number {
  return roundCurrency(Math.max(0, paidSubtotal - serviceFee));
}

export function computeOrderAmounts(lines: FeeLine[]): {
  subtotalAmount: number;
  serviceFee: number;
  totalAmount: number;
  organizerNet: number;
} {
  const subtotalAmount = computePaidSubtotal(lines);
  const serviceFee = computeServiceFee(subtotalAmount);
  return {
    subtotalAmount,
    serviceFee,
    totalAmount: subtotalAmount,
    organizerNet: computeOrganizerNet(subtotalAmount, serviceFee),
  };
}

export function computeOrderAmountsWithDiscount(
  lines: FeeLine[],
  promo: Pick<{ discountType: "percent" | "fixed"; discountValue: number }, "discountType" | "discountValue">,
): {
  subtotalAmount: number;
  discountAmount: number;
  serviceFee: number;
  totalAmount: number;
  organizerNet: number;
} {
  const subtotalAmount = computePaidSubtotal(lines);
  const discountAmount =
    subtotalAmount <= 0
      ? 0
      : Math.min(
          subtotalAmount,
          promo.discountType === "percent"
            ? roundCurrency(subtotalAmount * (promo.discountValue / 100))
            : roundCurrency(promo.discountValue),
        );
  const totalAmount = roundCurrency(Math.max(0, subtotalAmount - discountAmount));
  const serviceFee = computeServiceFee(totalAmount);

  return {
    subtotalAmount,
    discountAmount,
    serviceFee,
    totalAmount,
    organizerNet: computeOrganizerNet(totalAmount, serviceFee),
  };
}
