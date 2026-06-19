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
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
}

function buildSignature(
  data: PayfastFormFields,
  passphrase?: string,
): string {
  const pairs = Object.entries(data)
    .filter(([key, value]) => key !== "signature" && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${encodeValue(value)}`);

  let query = pairs.join("&");
  if (passphrase) {
    query += `&passphrase=${encodeValue(passphrase)}`;
  }

  return createHash("md5").update(query).digest("hex");
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

  fields.signature = buildSignature(fields, process.env.PAYFAST_PASSPHRASE);

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

  const expected = buildSignature(payload, process.env.PAYFAST_PASSPHRASE);
  return expected === signature;
}
