import { BRAND_NAME, getSiteOrigin } from "@/lib/site";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") {
      console.info("[Spotra] Email not configured — would send:", {
        to: input.to,
        subject: input.subject,
      });
      return { ok: true };
    }
    return {
      ok: false,
      error: "Transactional email is not configured.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[Spotra] Resend error:", response.status, body);
    return { ok: false, error: "Could not send email. Try again later." };
  }

  return { ok: true };
}

export function buildPasswordResetEmail(resetUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Reset your ${BRAND_NAME} password`;
  const text = [
    `Reset your ${BRAND_NAME} password using this link:`,
    resetUrl,
    "",
    "This link expires in 1 hour. If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>Reset your ${BRAND_NAME} password using the link below. This link expires in 1 hour.</p>
    <p><a href="${resetUrl}">Reset password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `.trim();

  return { subject, html, text };
}

export function passwordResetUrl(path: string, token: string): string {
  const url = new URL(path, getSiteOrigin());
  url.searchParams.set("token", token);
  return url.toString();
}
