/** Organiser platform fee — 3.5% excl VAT on post-discount ticket amount. */
export const ORGANIZER_FEE_RATE = 0.035;

/** @deprecated Use ORGANIZER_FEE_RATE */
export const SERVICE_FEE_RATE = ORGANIZER_FEE_RATE;

/** Flat booking fee per paid ticket charged to buyers at checkout. */
export const BOOKING_FEE_PER_TICKET = 6;

/** Display label e.g. "3.5%" */
export function formatOrganizerFeePercentLabel(): string {
  const pct = ORGANIZER_FEE_RATE * 100;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
}

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

/** Count of paid tickets (price > 0). */
export function computePaidTicketCount(lines: FeeLine[]): number {
  return lines.reduce((sum, line) => {
    if (line.price <= 0) return sum;
    return sum + line.quantity;
  }, 0);
}

/** Spotra platform fee — 3.5% of post-discount ticket amount. */
export function computeServiceFee(ticketAmount: number): number {
  if (ticketAmount <= 0) return 0;
  return roundCurrency(ticketAmount * ORGANIZER_FEE_RATE);
}

/** R6 per ticket when order has paid tickets. */
export function computeBookingFee(
  ticketCount: number,
  ticketAmount: number,
): number {
  if (ticketCount <= 0 || ticketAmount <= 0) return 0;
  return roundCurrency(ticketCount * BOOKING_FEE_PER_TICKET);
}

/** Estimated organizer payout after platform fee. */
export function computeOrganizerNet(
  ticketAmount: number,
  serviceFee: number,
): number {
  return roundCurrency(Math.max(0, ticketAmount - serviceFee));
}

export type OrderAmounts = {
  subtotalAmount: number;
  ticketAmount: number;
  bookingFee: number;
  serviceFee: number;
  totalAmount: number;
  organizerNet: number;
};

export function computeOrderAmounts(
  lines: FeeLine[],
  ticketCount?: number,
): OrderAmounts {
  const subtotalAmount = computePaidSubtotal(lines);
  const paidTicketCount = ticketCount ?? computePaidTicketCount(lines);
  const ticketAmount = subtotalAmount;
  const serviceFee = computeServiceFee(ticketAmount);
  const bookingFee = computeBookingFee(paidTicketCount, ticketAmount);
  const totalAmount = roundCurrency(ticketAmount + bookingFee);

  return {
    subtotalAmount,
    ticketAmount,
    bookingFee,
    serviceFee,
    totalAmount,
    organizerNet: computeOrganizerNet(ticketAmount, serviceFee),
  };
}

export function computeOrderAmountsWithDiscount(
  lines: FeeLine[],
  promo: Pick<
    { discountType: "percent" | "fixed"; discountValue: number },
    "discountType" | "discountValue"
  >,
  ticketCount?: number,
): OrderAmounts & { discountAmount: number } {
  const subtotalAmount = computePaidSubtotal(lines);
  const paidTicketCount = ticketCount ?? computePaidTicketCount(lines);
  const discountAmount =
    subtotalAmount <= 0
      ? 0
      : Math.min(
          subtotalAmount,
          promo.discountType === "percent"
            ? roundCurrency(subtotalAmount * (promo.discountValue / 100))
            : roundCurrency(promo.discountValue),
        );
  const ticketAmount = roundCurrency(Math.max(0, subtotalAmount - discountAmount));
  const serviceFee = computeServiceFee(ticketAmount);
  const bookingFee = computeBookingFee(paidTicketCount, ticketAmount);
  const totalAmount = roundCurrency(ticketAmount + bookingFee);

  return {
    subtotalAmount,
    discountAmount,
    ticketAmount,
    bookingFee,
    serviceFee,
    totalAmount,
    organizerNet: computeOrganizerNet(ticketAmount, serviceFee),
  };
}
