import { z } from "zod";

/** Event / tier identifiers (slugs and tier ids, not UUIDs). */
export const eventSlugSchema = z
  .string()
  .trim()
  .min(1, "Event not found.")
  .max(120);

export const tierIdSchema = z.string().trim().min(1).max(64);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "A valid email address is required.")
  .email("A valid email address is required.")
  .max(320);

export const personNameSchema = z
  .string()
  .trim()
  .min(1, "Your name is required.")
  .max(200);

/** Tier id → quantity map from checkout JSON. */
export const tierSelectionsSchema = z
  .record(
    tierIdSchema,
    z.coerce.number().int().min(0).max(8),
  )
  .refine(
    (selections) => Object.values(selections).some((qty) => qty > 0),
    { message: "Select at least one ticket." },
  )
  .refine(
    (selections) =>
      Object.values(selections).reduce((sum, qty) => sum + qty, 0) <= 10,
    { message: "Maximum 10 tickets per order." },
  );

export const checkoutFormSchema = z.object({
  eventSlug: eventSlugSchema,
  buyerName: personNameSchema,
  buyerEmail: emailSchema,
  buyerPhone: z.string().trim().max(30).optional().default(""),
  whatsappOptIn: z.boolean(),
  acceptTerms: z.literal(true, {
    message: "Accept the terms to continue.",
  }),
  selectionsRaw: z.string(),
  promoCode: z.string().trim().max(50).optional().default(""),
});

export const promoPreviewInputSchema = z.object({
  eventSlug: eventSlugSchema,
  rawCode: z.string().trim().min(1).max(50),
  selectionsRaw: z.string(),
});

export const ticketCodeSchema = z
  .string()
  .trim()
  .min(8)
  .max(48)
  .transform((value) => value.toUpperCase());

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Incorrect password.").max(200),
});

export const compTicketsFormSchema = z.object({
  eventSlug: eventSlugSchema,
  holderName: personNameSchema,
  holderEmail: emailSchema,
  tierId: tierIdSchema,
  qty: z.coerce.number().int().min(1).max(10),
});

export const orderIdSchema = z.string().uuid();

export const payfastItnSchema = z.object({
  m_payment_id: orderIdSchema,
  payment_status: z.string().min(1),
  amount_gross: z.string().optional(),
  merchant_id: z.string().optional(),
  pf_payment_id: z.string().optional(),
});
