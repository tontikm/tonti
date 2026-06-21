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

function encodeValue(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/%20/g, "+")
    .replace(/%[0-9a-f]{2}/gi, (match) => match.toUpperCase());
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

function appendPassphrase(query: string, passphrase?: string): string {
  if (!passphrase) return query;
  return `${query}&passphrase=${encodeValue(passphrase)}`;
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
      pairs.push(`${key}=${encodeValue(value)}`);
    }
  }
  return hashParamString(appendPassphrase(pairs.join("&"), passphrase));
}

function buildItnSignature(
  payload: Record<string, string>,
  passphrase?: string,
): string {
  const pairs: string[] = [];
  for (const key of Object.keys(payload)) {
    if (key === "signature") break;
    const value = payload[key];
    if (value !== "") {
      pairs.push(`${key}=${encodeValue(value)}`);
    }
  }
  return hashParamString(appendPassphrase(pairs.join("&"), passphrase));
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

export function verifyPayfastItn(
  payload: Record<string, string>,
): boolean {
  const signature = payload.signature;
  if (!signature) return false;

  const expected = buildItnSignature(payload, process.env.PAYFAST_PASSPHRASE);
  return expected === signature;
}
