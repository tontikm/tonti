export function isPayfastConfigured(): boolean {
  return Boolean(
    process.env.PAYFAST_MERCHANT_ID &&
      process.env.PAYFAST_MERCHANT_KEY &&
      process.env.NEXT_PUBLIC_SITE_URL,
  );
}

export function getPayfastProcessUrl(): string {
  return process.env.PAYFAST_SANDBOX === "true"
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";
}

export function getPayfastMerchantId(): string | undefined {
  return process.env.PAYFAST_MERCHANT_ID;
}

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ??
    "http://localhost:3000";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}
