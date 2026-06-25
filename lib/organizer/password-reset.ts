import { createHash, randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  buildPasswordResetEmail,
  passwordResetUrl,
  sendEmail,
} from "@/lib/email/send";
import { hashOrganizerPassword } from "@/lib/auth/organizer-password";

const RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function requestOrganizerPasswordReset(
  email: string,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      ok: false,
      error: "Password reset requires Supabase. Run migration 0027_organizer_password_resets.sql.",
    };
  }

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id, email, status")
    .eq("email", email)
    .maybeSingle();

  const successMessage =
    "If an account exists for that email, we sent a password reset link.";

  if (!organizer || organizer.status === "suspended") {
    return { ok: true, message: successMessage };
  }

  const token = generateResetToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();

  await supabase
    .from("organizer_password_resets")
    .delete()
    .eq("organizer_id", organizer.id as string);

  const { error: insertError } = await supabase
    .from("organizer_password_resets")
    .insert({
      organizer_id: organizer.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

  if (insertError) {
    if (
      insertError.message.includes("organizer_password_resets") ||
      insertError.message.includes("Could not find the table")
    ) {
      return {
        ok: false,
        error:
          "Run migration 0027_organizer_password_resets.sql in the Supabase SQL editor.",
      };
    }
    return { ok: false, error: insertError.message };
  }

  const resetUrl = passwordResetUrl("/organizer/reset-password", token);
  const emailContent = buildPasswordResetEmail(resetUrl);
  const sent = await sendEmail({
    to: organizer.email as string,
    ...emailContent,
  });

  if (!sent.ok) {
    await supabase
      .from("organizer_password_resets")
      .delete()
      .eq("token_hash", tokenHash);

    if (process.env.NODE_ENV === "development") {
      return {
        ok: true,
        message: `${successMessage} (Dev: ${resetUrl})`,
      };
    }

    return {
      ok: false,
      error:
        "We could not send a reset email right now. Contact support for help.",
    };
  }

  return { ok: true, message: successMessage };
}

export async function resetOrganizerPassword(
  token: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  const tokenHash = hashToken(trimmed);
  const { data: row } = await supabase
    .from("organizer_password_resets")
    .select("id, organizer_id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!row) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  if (new Date(row.expires_at as string).getTime() < Date.now()) {
    await supabase.from("organizer_password_resets").delete().eq("id", row.id);
    return { ok: false, error: "This reset link has expired. Request a new one." };
  }

  const passwordHash = hashOrganizerPassword(password);
  const { error: updateError } = await supabase
    .from("organizers")
    .update({ password_hash: passwordHash })
    .eq("id", row.organizer_id as string);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await supabase.from("organizer_password_resets").delete().eq("id", row.id);

  return { ok: true };
}
