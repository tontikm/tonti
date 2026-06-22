"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/require-auth";
import {
  clearAdminSession,
  getAdminSession,
  setAdminSession,
} from "@/lib/admin/session";
import type { OrganizerStatus } from "@/lib/admin/data";
import {
  verifyOrganizerPassword,
} from "@/lib/auth/organizer-password";

export type AdminLoginState = {
  error?: string;
};

export type AdminActionState = {
  error?: string;
  success?: string;
};

function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/organizers");
  revalidatePath("/admin/events");
  revalidatePath("/admin/orders");
  revalidatePath("/");
  revalidatePath("/events");
}

export async function loginAdmin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error:
        "Admin login requires Supabase. Add SUPABASE_SERVICE_ROLE_KEY and run migration 0020_platform_admins.sql.",
    };
  }

  const { data: admin, error } = await supabase
    .from("platform_admins")
    .select("id, email, password_hash, name")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    if (error.message.includes("Could not find the table")) {
      return {
        error:
          "Run supabase/migrations/0020_platform_admins.sql in the Supabase SQL editor.",
      };
    }
    return { error: error.message };
  }

  if (!admin) {
    return { error: "No admin account found for this email." };
  }

  if (!password || !verifyOrganizerPassword(password, admin.password_hash)) {
    return { error: "Incorrect password." };
  }

  await setAdminSession({
    id: admin.id as string,
    email: admin.email as string,
    name: (admin.name as string) ?? undefined,
    loggedInAt: new Date().toISOString(),
  });

  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateOrganizerStatus(
  organizerId: string,
  status: OrganizerStatus,
): Promise<AdminActionState> {
  const session = await requireAdminSession();
  if ("error" in session) return session;

  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Supabase is not configured." };

  const { error } = await supabase
    .from("organizers")
    .update({ status })
    .eq("id", organizerId);

  if (error) {
    if (isMissingStatusColumn(error)) {
      return {
        error:
          "Run supabase/migrations/0021_organizer_approval.sql in the Supabase SQL editor.",
      };
    }
    return { error: error.message };
  }

  revalidateAdminPaths();
  revalidatePath("/organizer");

  const labels: Record<OrganizerStatus, string> = {
    pending: "moved to pending",
    approved: "approved",
    suspended: "suspended",
  };
  return { success: `Organizer ${labels[status]}.` };
}

export async function toggleEventFeatured(
  slug: string,
  featured: boolean,
): Promise<AdminActionState> {
  const session = await requireAdminSession();
  if ("error" in session) return session;

  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Supabase is not configured." };

  const { error } = await supabase
    .from("events")
    .update({ featured })
    .eq("slug", slug);

  if (error) return { error: error.message };

  revalidateAdminPaths();
  revalidatePath(`/events/${slug}`);

  return {
    success: featured
      ? "Event featured on homepage."
      : "Removed from homepage carousel.",
  };
}

function isMissingStatusColumn(error: { message?: string }): boolean {
  return Boolean(
    error.message?.includes("status") &&
      error.message?.includes("column"),
  );
}
