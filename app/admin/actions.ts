"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/require-auth";
import {
  clearAdminSession,
  setAdminSession,
} from "@/lib/admin/session";
import type { OrganizerStatus, EventPublicationStatus } from "@/lib/admin/data";
import {
  verifyOrganizerPassword,
} from "@/lib/auth/organizer-password";
import type { CarouselImageSource } from "@/lib/carousel/slides";
import { getNextCarouselSortOrder } from "@/lib/carousel/slides";
import { uploadCarouselImage } from "@/lib/supabase/upload-carousel";

export type AdminLoginState = {
  error?: string;
};

export type AdminActionState = {
  error?: string;
  success?: string;
};

function revalidateAdminPaths() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/organizers");
  revalidatePath("/admin/events", "layout");
  revalidatePath("/admin/carousel");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payouts");
  revalidatePath("/");
  revalidatePath("/events");
}

function isMissingCarouselTable(error: { message?: string }): boolean {
  return Boolean(
    error.message?.includes("homepage_carousel_slides") &&
      (error.message?.includes("Could not find") ||
        error.message?.includes("does not exist")),
  );
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

  const now = new Date().toISOString();
  await setAdminSession({
    id: admin.id as string,
    email: admin.email as string,
    name: (admin.name as string) ?? undefined,
    loggedInAt: now,
    lastActivityAt: now,
  });

  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function logoutAdminOnIdle(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login?reason=idle");
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

export async function updateEventPublicationStatus(
  slug: string,
  publicationStatus: EventPublicationStatus,
): Promise<AdminActionState> {
  const session = await requireAdminSession();
  if ("error" in session) return session;

  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Supabase is not configured." };

  const { error } = await supabase
    .from("events")
    .update({ publication_status: publicationStatus })
    .eq("slug", slug);

  if (error) {
    if (isMissingPublicationColumn(error)) {
      return {
        error:
          "Run supabase/migrations/0024_event_publication.sql in the Supabase SQL editor.",
      };
    }
    return { error: error.message };
  }

  revalidateAdminPaths();
  revalidatePath(`/events/${slug}`);
  revalidatePath(`/admin/events/${slug}/preview`);
  revalidatePath(`/organizer/events/${slug}`);

  const labels: Record<EventPublicationStatus, string> = {
    pending: "moved to pending review",
    approved: "approved and published",
    rejected: "rejected",
  };
  return { success: `Event ${labels[publicationStatus]}.` };
}

function isMissingPublicationColumn(error: { message?: string }): boolean {
  return Boolean(
    error.message?.includes("publication_status") &&
      error.message?.includes("column"),
  );
}

function isMissingStatusColumn(error: { message?: string }): boolean {
  return Boolean(
    error.message?.includes("status") &&
      error.message?.includes("column"),
  );
}

export async function recordOrganizerPayout(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdminSession();
  if ("error" in session) return session;

  const organizerId = String(formData.get("organizerId") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const paidAtRaw = String(formData.get("paidAt") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!organizerId) {
    return { error: "Missing organizer." };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid payout amount." };
  }

  const paidAt = paidAtRaw
    ? new Date(`${paidAtRaw}T12:00:00`).toISOString()
    : new Date().toISOString();

  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Supabase is not configured." };

  const { error } = await supabase.from("organizer_payouts").insert({
    organizer_id: organizerId,
    amount: Math.round(amount * 100) / 100,
    paid_at: paidAt,
    reference,
    notes,
  });

  if (error) {
    if (error.message.includes("Could not find the table")) {
      return {
        error:
          "Run supabase/migrations/0023_organizer_payouts.sql in the Supabase SQL editor.",
      };
    }
    return { error: error.message };
  }

  revalidateAdminPaths();
  revalidatePath(`/admin/organizers/${organizerId}`);

  return { success: `Recorded payout of R${amount.toFixed(2)}.` };
}

async function requireCarouselAdmin() {
  const session = await requireAdminSession();
  if ("error" in session) return { error: session.error } as const;
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Supabase is not configured." } as const;
  return { supabase } as const;
}

function carouselTableError(): AdminActionState {
  return {
    error:
      "Run supabase/migrations/0025_homepage_carousel.sql in the Supabase SQL editor.",
  };
}

export async function createCarouselEventSlide(
  eventSlug: string,
): Promise<AdminActionState> {
  const auth = await requireCarouselAdmin();
  if ("error" in auth) return auth;

  const slug = eventSlug.trim();
  if (!slug) return { error: "Select an event." };

  const { data: event, error: eventError } = await auth.supabase
    .from("events")
    .select("slug, hero_image")
    .eq("slug", slug)
    .maybeSingle();

  if (eventError) {
    if (isMissingCarouselTable(eventError)) return carouselTableError();
    return { error: eventError.message };
  }
  if (!event) return { error: "Event not found." };

  const sortOrder = await getNextCarouselSortOrder();
  const imageSource: CarouselImageSource = event.hero_image ? "hero" : "poster";

  const { error } = await auth.supabase.from("homepage_carousel_slides").insert({
    sort_order: sortOrder,
    slide_type: "event",
    event_slug: slug,
    image_source: imageSource,
    active: true,
  });

  if (error) {
    if (isMissingCarouselTable(error)) return carouselTableError();
    return { error: error.message };
  }

  revalidateAdminPaths();
  return { success: "Event added to carousel." };
}

export async function createCarouselCustomSlide(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const auth = await requireCarouselAdmin();
  if ("error" in auth) return auth;

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim() || null;
  const imageRaw = formData.get("image");

  if (!title) return { error: "Title is required." };
  if (!linkUrl) return { error: "Link URL is required." };
  if (!(imageRaw instanceof File) || imageRaw.size === 0) {
    return { error: "Image is required." };
  }

  const sortOrder = await getNextCarouselSortOrder();
  const slideId = crypto.randomUUID();

  let customImageUrl: string;
  try {
    customImageUrl = await uploadCarouselImage(
      auth.supabase,
      slideId,
      imageRaw,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload carousel image.";
    if (message.includes("Bucket not found")) {
      return {
        error:
          "Storage bucket missing. Run supabase/migrations/0002_event_posters_storage.sql.",
      };
    }
    return { error: message };
  }

  const { error } = await auth.supabase.from("homepage_carousel_slides").insert({
    id: slideId,
    sort_order: sortOrder,
    slide_type: "custom",
    custom_image_url: customImageUrl,
    title,
    subtitle,
    link_url: linkUrl,
    cta_label: ctaLabel,
    active: true,
  });

  if (error) {
    if (isMissingCarouselTable(error)) return carouselTableError();
    return { error: error.message };
  }

  revalidateAdminPaths();
  return { success: "Custom slide added to carousel." };
}

export async function updateCarouselSlide(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const auth = await requireCarouselAdmin();
  if ("error" in auth) return auth;

  const slideId = String(formData.get("slideId") ?? "").trim();
  if (!slideId) return { error: "Missing slide." };

  const { data: existing, error: loadError } = await auth.supabase
    .from("homepage_carousel_slides")
    .select(
      "id, slide_type, event_slug, image_source, custom_image_url, title, subtitle, link_url, cta_label, active",
    )
    .eq("id", slideId)
    .maybeSingle();

  if (loadError) {
    if (isMissingCarouselTable(loadError)) return carouselTableError();
    return { error: loadError.message };
  }
  if (!existing) return { error: "Slide not found." };

  const slideType = existing.slide_type as "event" | "custom";
  const imageRaw = formData.get("image");
  const hasNewImage = imageRaw instanceof File && imageRaw.size > 0;

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (slideType === "event") {
    const imageSource = String(formData.get("imageSource") ?? "").trim() as
      | CarouselImageSource
      | "";
    if (!["hero", "poster", "custom"].includes(imageSource)) {
      return { error: "Select a valid image source." };
    }
    patch.image_source = imageSource;

    const title = String(formData.get("title") ?? "").trim();
    const subtitle = String(formData.get("subtitle") ?? "").trim();
    const ctaLabel = String(formData.get("ctaLabel") ?? "").trim();
    patch.title = title || null;
    patch.subtitle = subtitle || null;
    patch.cta_label = ctaLabel || null;

    if (imageSource === "custom") {
      if (hasNewImage) {
        try {
          patch.custom_image_url = await uploadCarouselImage(
            auth.supabase,
            slideId,
            imageRaw,
          );
        } catch (err) {
          return {
            error:
              err instanceof Error
                ? err.message
                : "Failed to upload carousel image.",
          };
        }
      } else if (!existing.custom_image_url) {
        return { error: "Upload a custom image for this slide." };
      }
    } else {
      patch.custom_image_url = null;
    }
  } else {
    const title = String(formData.get("title") ?? "").trim();
    const subtitle = String(formData.get("subtitle") ?? "").trim();
    const linkUrl = String(formData.get("linkUrl") ?? "").trim();
    const ctaLabel = String(formData.get("ctaLabel") ?? "").trim();

    if (!title) return { error: "Title is required." };
    if (!linkUrl) return { error: "Link URL is required." };

    patch.title = title;
    patch.subtitle = subtitle || null;
    patch.link_url = linkUrl;
    patch.cta_label = ctaLabel || null;

    if (hasNewImage) {
      try {
        patch.custom_image_url = await uploadCarouselImage(
          auth.supabase,
          slideId,
          imageRaw,
        );
      } catch (err) {
        return {
          error:
            err instanceof Error
              ? err.message
              : "Failed to upload carousel image.",
        };
      }
    } else if (!existing.custom_image_url) {
      return { error: "Image is required." };
    }
  }

  const { error } = await auth.supabase
    .from("homepage_carousel_slides")
    .update(patch)
    .eq("id", slideId);

  if (error) {
    if (isMissingCarouselTable(error)) return carouselTableError();
    return { error: error.message };
  }

  revalidateAdminPaths();
  return { success: "Slide updated." };
}

export async function deleteCarouselSlide(
  slideId: string,
): Promise<AdminActionState> {
  const auth = await requireCarouselAdmin();
  if ("error" in auth) return auth;

  const id = slideId.trim();
  if (!id) return { error: "Missing slide." };

  const { error } = await auth.supabase
    .from("homepage_carousel_slides")
    .delete()
    .eq("id", id);

  if (error) {
    if (isMissingCarouselTable(error)) return carouselTableError();
    return { error: error.message };
  }

  revalidateAdminPaths();
  return { success: "Slide removed from carousel." };
}

export async function toggleCarouselSlideActive(
  slideId: string,
  active: boolean,
): Promise<AdminActionState> {
  const auth = await requireCarouselAdmin();
  if ("error" in auth) return auth;

  const { error } = await auth.supabase
    .from("homepage_carousel_slides")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", slideId);

  if (error) {
    if (isMissingCarouselTable(error)) return carouselTableError();
    return { error: error.message };
  }

  revalidateAdminPaths();
  return {
    success: active ? "Slide activated." : "Slide hidden from homepage.",
  };
}

export async function reorderCarouselSlide(
  slideId: string,
  direction: "up" | "down",
): Promise<AdminActionState> {
  const auth = await requireCarouselAdmin();
  if ("error" in auth) return auth;

  const { data: slides, error: listError } = await auth.supabase
    .from("homepage_carousel_slides")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (listError) {
    if (isMissingCarouselTable(listError)) return carouselTableError();
    return { error: listError.message };
  }

  const ordered = slides ?? [];
  const index = ordered.findIndex((row) => row.id === slideId);
  if (index === -1) return { error: "Slide not found." };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= ordered.length) {
    return { error: "Cannot move slide further in that direction." };
  }

  const current = ordered[index];
  const neighbor = ordered[swapIndex];
  const currentOrder = Number(current.sort_order);
  const neighborOrder = Number(neighbor.sort_order);

  const { error: firstError } = await auth.supabase
    .from("homepage_carousel_slides")
    .update({ sort_order: neighborOrder, updated_at: new Date().toISOString() })
    .eq("id", current.id);

  if (firstError) return { error: firstError.message };

  const { error: secondError } = await auth.supabase
    .from("homepage_carousel_slides")
    .update({ sort_order: currentOrder, updated_at: new Date().toISOString() })
    .eq("id", neighbor.id);

  if (secondError) return { error: secondError.message };

  revalidateAdminPaths();
  return { success: "Slide order updated." };
}
