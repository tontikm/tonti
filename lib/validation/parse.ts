import { z } from "zod";
import {
  checkoutFormSchema,
  compTicketsFormSchema,
  forgotPasswordSchema,
  loginFormSchema,
  newPasswordSchema,
  tierSelectionsSchema,
} from "@/lib/validation/schemas";

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

export function parseTierSelections(raw: string): ParseResult<Record<string, number>> {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid ticket selection." };
  }

  const result = tierSelectionsSchema.safeParse(json);
  if (!result.success) {
    return { ok: false, error: formatZodError(result.error) };
  }

  return { ok: true, data: result.data };
}

export function parseCheckoutForm(
  formData: FormData,
): ParseResult<z.infer<typeof checkoutFormSchema>> {
  const result = checkoutFormSchema.safeParse({
    eventSlug: formData.get("eventSlug"),
    buyerName: formData.get("buyerName"),
    buyerEmail: formData.get("buyerEmail"),
    buyerPhone: formData.get("buyerPhone") ?? "",
    whatsappOptIn: formData.get("whatsappOptIn") === "on",
    acceptTerms: formData.get("acceptTerms") === "on",
    selectionsRaw: formData.get("selections") ?? "{}",
    promoCode: formData.get("promoCode") ?? "",
  });

  if (!result.success) {
    return { ok: false, error: formatZodError(result.error) };
  }

  return { ok: true, data: result.data };
}

export function parseLoginForm(
  formData: FormData,
): ParseResult<z.infer<typeof loginFormSchema>> {
  const result = loginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    const message = formatZodError(result.error);
    if (message === "A valid email address is required.") {
      return { ok: false, error: "Enter a valid email address." };
    }
    return { ok: false, error: message };
  }

  return { ok: true, data: result.data };
}

export function parseCompTicketsForm(
  formData: FormData,
): ParseResult<z.infer<typeof compTicketsFormSchema>> {
  const result = compTicketsFormSchema.safeParse({
    eventSlug: formData.get("eventSlug"),
    holderName: formData.get("holderName"),
    holderEmail: formData.get("holderEmail"),
    tierId: formData.get("tierId"),
    qty: formData.get("qty") ?? 1,
  });

  if (!result.success) {
    const issue = result.error.issues[0];
    if (issue?.path[0] === "qty") {
      return { ok: false, error: "Issue between 1 and 10 tickets at a time." };
    }
    const message = formatZodError(result.error);
    if (message === "Your name is required.") {
      return { ok: false, error: "Guest name is required." };
    }
    if (message === "A valid email address is required.") {
      return { ok: false, error: "A valid guest email is required." };
    }
    return { ok: false, error: message };
  }

  return { ok: true, data: result.data };
}

export function parseForgotPasswordForm(
  formData: FormData,
): ParseResult<z.infer<typeof forgotPasswordSchema>> {
  const result = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    const message = formatZodError(result.error);
    if (message === "A valid email address is required.") {
      return { ok: false, error: "Enter a valid email address." };
    }
    return { ok: false, error: message };
  }

  return { ok: true, data: result.data };
}

export function parseNewPasswordForm(
  formData: FormData,
): ParseResult<z.infer<typeof newPasswordSchema>> {
  const result = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return { ok: false, error: formatZodError(result.error) };
  }

  return { ok: true, data: result.data };
}
