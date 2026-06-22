import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { OrganizerProfile } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { isMissingColumnError } from "@/lib/supabase/errors";

const ORGANIZER_COLUMNS = `
  id, email, name, slug, logo, bio, phone, website_url, instagram_url,
  invoice_company_name, invoice_address_line1, invoice_address_line2,
  invoice_city, invoice_province, invoice_postal_code, vat_number,
  default_refund_policy, status, created_at`;

function mapOrganizerRow(row: Record<string, unknown>): OrganizerProfile {
  return {
    id: row.id as string,
    email: row.email as string,
    name: (row.name as string) ?? null,
    slug: (row.slug as string) ?? null,
    logo: (row.logo as string) ?? null,
    bio: (row.bio as string) ?? null,
    phone: (row.phone as string) ?? null,
    websiteUrl: (row.website_url as string) ?? null,
    instagramUrl: (row.instagram_url as string) ?? null,
    invoiceCompanyName: (row.invoice_company_name as string) ?? null,
    invoiceAddressLine1: (row.invoice_address_line1 as string) ?? null,
    invoiceAddressLine2: (row.invoice_address_line2 as string) ?? null,
    invoiceCity: (row.invoice_city as string) ?? null,
    invoiceProvince: (row.invoice_province as string) ?? null,
    invoicePostalCode: (row.invoice_postal_code as string) ?? null,
    vatNumber: (row.vat_number as string) ?? null,
    defaultRefundPolicy: (row.default_refund_policy as string) ?? null,
    status: (row.status as OrganizerProfile["status"]) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export function suggestOrganizerSlug(name: string | null, email: string): string {
  const base = name?.trim() ? slugify(name) : slugify(email.split("@")[0] ?? "organizer");
  return base || "organizer";
}

export async function getOrganizerByEmail(
  email: string,
): Promise<OrganizerProfile | null> {
  const supabase = getSupabaseAdmin() ?? getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("organizers")
    .select(ORGANIZER_COLUMNS)
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error)) return null;
    return null;
  }

  return data ? mapOrganizerRow(data as Record<string, unknown>) : null;
}

export async function getOrganizerById(
  id: string,
): Promise<OrganizerProfile | null> {
  const supabase = getSupabaseServer() ?? getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("organizers")
    .select(ORGANIZER_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) return null;
  return data ? mapOrganizerRow(data as Record<string, unknown>) : null;
}

export async function getOrganizerBySlug(
  slug: string,
): Promise<OrganizerProfile | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("organizers")
    .select(ORGANIZER_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) return null;
  return data ? mapOrganizerRow(data as Record<string, unknown>) : null;
}

export async function isOrganizerSlugTaken(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  let query = supabase.from("organizers").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query.maybeSingle();
  return Boolean(data);
}

export type OrganizerProfileUpdate = {
  name?: string | null;
  slug?: string | null;
  bio?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  invoiceCompanyName?: string | null;
  invoiceAddressLine1?: string | null;
  invoiceAddressLine2?: string | null;
  invoiceCity?: string | null;
  invoiceProvince?: string | null;
  invoicePostalCode?: string | null;
  vatNumber?: string | null;
  defaultRefundPolicy?: string | null;
  logo?: string | null;
};

export function profileToDbRow(
  update: OrganizerProfileUpdate,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (update.name !== undefined) row.name = update.name;
  if (update.slug !== undefined) row.slug = update.slug;
  if (update.bio !== undefined) row.bio = update.bio;
  if (update.phone !== undefined) row.phone = update.phone;
  if (update.websiteUrl !== undefined) row.website_url = update.websiteUrl;
  if (update.instagramUrl !== undefined) row.instagram_url = update.instagramUrl;
  if (update.invoiceCompanyName !== undefined) {
    row.invoice_company_name = update.invoiceCompanyName;
  }
  if (update.invoiceAddressLine1 !== undefined) {
    row.invoice_address_line1 = update.invoiceAddressLine1;
  }
  if (update.invoiceAddressLine2 !== undefined) {
    row.invoice_address_line2 = update.invoiceAddressLine2;
  }
  if (update.invoiceCity !== undefined) row.invoice_city = update.invoiceCity;
  if (update.invoiceProvince !== undefined) {
    row.invoice_province = update.invoiceProvince;
  }
  if (update.invoicePostalCode !== undefined) {
    row.invoice_postal_code = update.invoicePostalCode;
  }
  if (update.vatNumber !== undefined) row.vat_number = update.vatNumber;
  if (update.defaultRefundPolicy !== undefined) {
    row.default_refund_policy = update.defaultRefundPolicy;
  }
  if (update.logo !== undefined) row.logo = update.logo;
  return row;
}

export function isProfileComplete(profile: OrganizerProfile): boolean {
  return Boolean(
    profile.slug &&
      profile.invoiceAddressLine1 &&
      profile.invoiceCity &&
      profile.invoiceProvince,
  );
}
