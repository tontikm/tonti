"use server";

import { redirect } from "next/navigation";
import { sanitizeReturnTo } from "@/lib/auth/sanitize-return-to";
import { createAuthClient } from "@/lib/supabase/server-auth";
import { getSiteOrigin } from "@/lib/site";

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

  const origin = getSiteOrigin();
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
  redirect(sanitizeReturnTo(returnTo));
}
