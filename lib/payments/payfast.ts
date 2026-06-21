import { createHash } from "crypto";
import { getPayfastProcessUrl, getSiteUrl } from "@/lib/payments/config";

export type PayfastCheckoutInput = {
  orderId: string;
  eventSlug: string;
  amount: number;
  itemName: string;
  buyerName: string;
  buyerEmail: string;
};

export type PayfastFormFields = Record<string, string>;
export type PayfastItnField = [key: string, value: string];

function encodeCheckoutValue(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/%20/g, "+")
    .replace(/%[0-9a-f]{2}/gi, (match) => match.toUpperCase());
}

/** PHP urlencode-compatible — used for ITN verification (no trim / uppercase). */
function encodeItnValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

/** Document order for custom integration checkout — not alphabetical (API-only). */
const CHECKOUT_SIGNATURE_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "cell_number",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
] as const;

function appendCheckoutPassphrase(query: string, passphrase?: string): string {
  if (!passphrase) return query;
  return `${query}&passphrase=${encodeCheckoutValue(passphrase)}`;
}

function appendItnPassphrase(query: string, passphrase?: string): string {
  if (!passphrase) return query;
  return `${query}&passphrase=${encodeItnValue(passphrase)}`;
}

function hashParamString(query: string): string {
  return createHash("md5").update(query).digest("hex");
}

function buildCheckoutSignature(
  data: PayfastFormFields,
  passphrase?: string,
): string {
  const pairs: string[] = [];
  for (const key of CHECKOUT_SIGNATURE_ORDER) {
    const value = data[key];
    if (value !== undefined && value !== "") {
      pairs.push(`${key}=${encodeCheckoutValue(value)}`);
    }
  }
  return hashParamString(appendCheckoutPassphrase(pairs.join("&"), passphrase));
}

function buildItnSignature(
  fields: PayfastItnField[],
  passphrase?: string,
): string {
  const pairs: string[] = [];
  for (const [key, value] of fields) {
    if (key === "signature") break;
    pairs.push(`${key}=${encodeItnValue(value)}`);
  }
  return hashParamString(appendItnPassphrase(pairs.join("&"), passphrase));
}

export function buildPayfastCheckout(
  input: PayfastCheckoutInput,
): { action: string; fields: PayfastFormFields } {
  const siteUrl = getSiteUrl();
  const [firstName, ...rest] = input.buyerName.trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;

  const fields: PayfastFormFields = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID ?? "",
    merchant_key: process.env.PAYFAST_MERCHANT_KEY ?? "",
    return_url: `${siteUrl}/payments/payfast/complete?orderId=${input.orderId}`,
    cancel_url: `${siteUrl}/events/${input.eventSlug}/checkout?payment=cancelled`,
    notify_url: `${siteUrl}/api/payments/payfast/notify`,
    name_first: firstName,
    name_last: lastName,
    email_address: input.buyerEmail,
    m_payment_id: input.orderId,
    amount: input.amount.toFixed(2),
    item_name: input.itemName.slice(0, 100),
  };

  fields.signature = buildCheckoutSignature(
    fields,
    process.env.PAYFAST_PASSPHRASE,
  );

  return {
    action: getPayfastProcessUrl(),
    fields,
  };
}

export function verifyPayfastItn(fields: PayfastItnField[]): boolean {
  const signature = fields.find(([key]) => key === "signature")?.[1];
  if (!signature) return false;

  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();
  const expected = buildItnSignature(fields, passphrase);
  return expected === signature;
}
