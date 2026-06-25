"use server";

import { redirect } from "next/navigation";
import { sanitizeReturnTo } from "@/lib/auth/sanitize-return-to";
import { clearFanLastActivity, setFanLastActivity } from "@/lib/auth/fan-activity";
import { createAuthClient } from "@/lib/supabase/server-auth";
import { getRequestOrigin } from "@/lib/site";

export type AuthState = {
  error?: string;
  message?: string;
};

function authNotConfigured(): AuthState {
  return {
    error:
      "Fan sign-in is not configured. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and enable Google in Supabase Auth.",
  };
}

export async function signInWithEmail(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createAuthClient();
  if (!supabase) return authNotConfigured();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const returnTo = sanitizeReturnTo(String(formData.get("returnTo") ?? "/"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  await setFanLastActivity();

  redirect(returnTo);
}

export async function signUpWithEmail(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createAuthClient();
  if (!supabase) return authNotConfigured();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const returnTo = sanitizeReturnTo(String(formData.get("returnTo") ?? "/"));

  if (!name) return { error: "Your name is required." };
  if (!email) return { error: "Email is required." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const origin = await getRequestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
    },
  });

  if (error) return { error: error.message };

  if (data.session) {
    await setFanLastActivity();
    redirect(returnTo);
  }

  return {
    message:
      "Check your email to confirm your account, then sign in to continue.",
  };
}

export async function signOut(returnTo = "/"): Promise<void> {
  const supabase = await createAuthClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  await clearFanLastActivity();
  redirect(sanitizeReturnTo(returnTo));
}

export async function requestFanPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createAuthClient();
  if (!supabase) return authNotConfigured();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return { error: "Enter a valid email address." };
  }

  const origin = await getRequestOrigin();
  const redirectTo = `${origin}/auth/confirm?next=${encodeURIComponent("/auth/update-password")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) return { error: error.message };

  return {
    message:
      "If an account exists for that email, we sent a password reset link.",
  };
}

export async function updateFanPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createAuthClient();
  if (!supabase) return authNotConfigured();

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const returnTo = sanitizeReturnTo(String(formData.get("returnTo") ?? "/account"));

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Your reset link has expired. Request a new password reset email.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  await setFanLastActivity();
  redirect(returnTo);
}
