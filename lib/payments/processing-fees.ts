export type PaymentProcessingMethod = "card" | "eft";

/** Card: R2 excl VAT + 3.20% excl VAT (VAT-inclusive: R2.30 + 3.68%). */
export const CARD_PROCESSING_FLAT_INCL_VAT = 2.3;
export const CARD_PROCESSING_RATE_INCL_VAT = 0.0368;

/** EFT / Capitec Pay: 2% with R2.00 minimum per transaction. */
export const EFT_PROCESSING_RATE = 0.02;
export const EFT_PROCESSING_MIN = 2;

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Map PayFast payment_method strings to our processing fee category. */
export function mapPayfastPaymentMethod(
  raw: string | null | undefined,
): PaymentProcessingMethod {
  const value = (raw ?? "").toLowerCase();
  if (
    value.includes("cc") ||
    value.includes("card") ||
    value.includes("credit") ||
    value.includes("debit")
  ) {
    return "card";
  }
  return "eft";
}

/** Spotra-absorbed processing fee for internal margin reporting. */
export function computeProcessingFee(
  transactionAmount: number,
  method: PaymentProcessingMethod,
): number {
  if (transactionAmount <= 0) return 0;

  if (method === "card") {
    return roundCurrency(
      CARD_PROCESSING_FLAT_INCL_VAT +
        transactionAmount * CARD_PROCESSING_RATE_INCL_VAT,
    );
  }

  return roundCurrency(
    Math.max(EFT_PROCESSING_MIN, transactionAmount * EFT_PROCESSING_RATE),
  );
}
