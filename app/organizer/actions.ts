"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { EventCategory, Genre } from "@/lib/types";
import { isEventCategory } from "@/lib/data/categories";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  uploadEventPoster,
  uploadOrganizerLogo,
  uploadProfileOrganizerLogo,
  validateOrganizerLogoFile,
  validatePosterFile,
} from "@/lib/supabase/upload-poster";
import {
  requireOrganizerSession,
  requireOwnEvent,
} from "@/lib/organizer/require-auth";
import {
  clearOrganizerSession,
  getOrganizerSession,
  setOrganizerSession,
} from "@/lib/organizer/session";
import {
  getOrganizerByEmail,
  isOrganizerSlugTaken,
  profileToDbRow,
  suggestOrganizerSlug,
  type OrganizerProfileUpdate,
} from "@/lib/organizer/profile";
import { DEFAULT_ARTIST_IMAGE, DEFAULT_VENUE_IMAGE } from "@/lib/images";
import { ALL_CITIES } from "@/lib/data/cities";
import { slugify, sastToIso } from "@/lib/utils";
import { fulfillTicketOrder } from "@/lib/tickets/fulfill-order";
import { normalizePromoCode } from "@/lib/promo/codes";
import { sanitizeReturnTo } from "@/lib/auth/sanitize-return-to";
import { GENRES } from "@/lib/data/genres";
import {
  hashOrganizerPassword,
  validateOrganizerPassword,
  verifyOrganizerPassword,
} from "@/lib/auth/organizer-password";
import {
  isMissingColumnError,
  ORGANIZER_BRANDING_MIGRATION_HINT,
} from "@/lib/supabase/errors";

export type ActionState = {
  error?: string;
  success?: string;
};

export type LoginState = {
  error?: string;
};

export async function loginOrganizer(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data: organizer, error } = await supabase
      .from("organizers")
      .select("id, email, password_hash, name, slug")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      if (error.message.includes("Could not find the table")) {
        return {
          error:
            "Organizer accounts require migration 0005_organizers.sql in the Supabase SQL editor.",
        };
      }
      return { error: error.message };
    }

    if (!organizer) {
      return { error: "No account found. Register first or check your email." };
    }

    if (!password || !verifyOrganizerPassword(password, organizer.password_hash)) {
      return { error: "Incorrect password." };
    }

    await setOrganizerSession({
      id: organizer.id as string,
      email: organizer.email as string,
      name: (organizer.name as string) ?? undefined,
      slug: (organizer.slug as string) ?? undefined,
      loggedInAt: new Date().toISOString(),
    });

    redirect("/organizer");
  }

  const devPassword = process.env.ORGANIZER_DEV_PASSWORD;
  if (!devPassword) {
    return {
      error:
        "Connect Supabase and run migration 0005, or set ORGANIZER_DEV_PASSWORD for local dev.",
    };
  }
  if (password !== devPassword) {
    return { error: "Incorrect password." };
  }

  await setOrganizerSession({
    email,
    loggedInAt: new Date().toISOString(),
  });

  redirect("/organizer");
}

export async function registerOrganizer(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const name = String(formData.get("name") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const passwordError = validateOrganizerPassword(password);
  if (passwordError) return { error: passwordError };
  if (password !== confirm) return { error: "Passwords do not match." };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error:
        "Registration requires Supabase. Add SUPABASE_SERVICE_ROLE_KEY and run migration 0005_organizers.sql.",
    };
  }

  const { data: existing } = await supabase
    .from("organizers")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const slug = suggestOrganizerSlug(name, email);

  const { data: created, error } = await supabase
    .from("organizers")
    .insert({
      email,
      name,
      slug,
      password_hash: hashOrganizerPassword(password),
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.message.includes("Could not find the table")) {
      return {
        error:
          "Run supabase/migrations/0005_organizers.sql in the Supabase SQL editor.",
      };
    }
    return { error: error.message };
  }

  await setOrganizerSession({
    id: created.id as string,
    email,
    name: name ?? undefined,
    slug: (created.slug as string) ?? slug,
    loggedInAt: new Date().toISOString(),
  });

  redirect("/organizer");
}

export async function logoutOrganizer(formData: FormData): Promise<void> {
  await clearOrganizerSession();
  const raw = formData.get("returnTo");
  if (typeof raw === "string" && raw.trim()) {
    redirect(sanitizeReturnTo(raw));
  }
  redirect("/organizer/login");
}

type ParsedTier = {
  id: string;
  name: string;
  price: number;
  capacity: number;
  description: string | null;
  position: number;
};

type ParsedEventForm = {
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  posterFile: File | null;
  organizerName: string | null;
  organizerLogoFile: File | null;
  showDateTime: string;
  endDateTime: string;
  doorsMinutes: number;
  category: EventCategory;
  venueName: string;
  venueSlug: string;
  venueCitySlug: string;
  venueAddress: string;
  venueCapacity: number;
  featured: boolean;
  ageLimit: number | null;
  ageMax: number | null;
  tags: string[];
  artistNames: string[];
  artistSlugs: string[];
  tiers: ParsedTier[];
  prohibitedItems: string[];
  organizerId: string | null;
  showOrganizerProfile: boolean;
  contactEmail?: string | null;
  refundPolicy?: string | null;
};

function parseEventForm(
  formData: FormData,
  options: { requirePoster: boolean },
): ParsedEventForm | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugify(title);
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const posterRaw = formData.get("poster");
  const posterFile =
    posterRaw instanceof File && posterRaw.size > 0 ? posterRaw : null;
  const organizerName =
    String(formData.get("organizerName") ?? "").trim() || null;
  const organizerLogoRaw = formData.get("organizerLogo");
  const organizerLogoFile =
    organizerLogoRaw instanceof File && organizerLogoRaw.size > 0
      ? organizerLogoRaw
      : null;
  const showDateTime = String(formData.get("showDateTime") ?? "");
  const endDateTime = String(formData.get("endDateTime") ?? "").trim();
  const doorsMinutes = Number(formData.get("doorsMinutes") ?? 60);
  const category = String(formData.get("category") ?? "");
  const venueName = String(formData.get("venueName") ?? "").trim();
  const venueSlug = String(formData.get("venueSlug") ?? "").trim();
  const venueCitySlug = String(formData.get("venueCitySlug") ?? "").trim();
  const venueAddress = String(formData.get("venueAddress") ?? "").trim();
  const venueCapacity = Number(formData.get("venueCapacity") ?? 500);
  const featured = formData.get("featured") === "on";
  const showOrganizerProfile = formData.get("showOrganizerProfile") === "on";
  const ageLimitRaw = String(formData.get("ageLimit") ?? "").trim();
  const ageLimit = ageLimitRaw ? Number(ageLimitRaw) : null;
  const ageMaxRaw = String(formData.get("ageMax") ?? "").trim();
  const ageMax = ageMaxRaw ? Number(ageMaxRaw) : null;
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const artistNames = formData
    .getAll("artistNames")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const artistSlugs = formData.getAll("artistSlugs").map(String);
  const prohibitedFromList = formData
    .getAll("prohibitedItems")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const prohibitedRaw = String(formData.get("prohibitedItemsText") ?? "").trim();
  const prohibitedItems =
    prohibitedFromList.length > 0
      ? prohibitedFromList
      : prohibitedRaw
        ? prohibitedRaw.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
  const organizerId =
    String(formData.get("organizerId") ?? "").trim() || null;

  const tierNames = formData.getAll("tierName").map(String);
  const tierIds = formData.getAll("tierId").map(String);
  const tierPrices = formData.getAll("tierPrice").map(String);
  const tierCapacities = formData.getAll("tierCapacity").map(String);
  const tierDescriptions = formData.getAll("tierDescription").map(String);

  if (!title) return { error: "Title is required." };
  if (!slug) return { error: "URL slug is required." };
  if (!description) return { error: "Description is required." };
  if (options.requirePoster && !posterFile) {
    return { error: "Poster image is required." };
  }
  if (posterFile) {
    const posterError = validatePosterFile(posterFile);
    if (posterError) return { error: posterError };
  }
  if (organizerLogoFile) {
    const logoError = validateOrganizerLogoFile(organizerLogoFile);
    if (logoError) return { error: logoError };
  }
  if (organizerLogoFile && !organizerName) {
    return { error: "Add an organizer name when uploading a logo." };
  }
  if (!showDateTime) return { error: "Show date and time are required." };
  if (!venueName) return { error: "Venue is required." };
  if (!isEventCategory(category)) return { error: "Select a category." };
  if (
    ageLimit != null &&
    ageMax != null &&
    (!Number.isInteger(ageMax) || ageMax < ageLimit)
  ) {
    return {
      error: "Maximum age must be greater than or equal to minimum age.",
    };
  }
  if (tierNames.length === 0 || !tierNames[0]?.trim()) {
    return { error: "Add at least one ticket tier." };
  }

  const tiers = tierNames
    .map((name, i) => ({
      id: tierIds[i]?.trim() || slugify(name) || `tier-${i + 1}`,
      name: name.trim(),
      price: Number(tierPrices[i] ?? 0),
      capacity: Number(tierCapacities[i] ?? 0),
      description: tierDescriptions[i]?.trim() || null,
      position: i,
    }))
    .filter((t) => t.name);

  if (tiers.some((t) => !t.name || t.capacity <= 0)) {
    return { error: "Each tier needs a name and capacity greater than 0." };
  }

  return {
    title,
    slug,
    subtitle,
    description,
    posterFile,
    organizerName,
    organizerLogoFile,
    showDateTime,
    endDateTime,
    doorsMinutes,
    category,
    venueName,
    venueSlug,
    venueCitySlug,
    venueAddress,
    venueCapacity,
    featured,
    ageLimit,
    ageMax,
    tags,
    artistNames,
    artistSlugs,
    tiers,
    prohibitedItems,
    organizerId,
    showOrganizerProfile,
  };
}

async function resolveVenueSlug(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  venueName: string,
  venueSlugHint: string,
  createDetails?: {
    citySlug: string;
    address: string;
    capacity: number;
  },
): Promise<{ slug: string } | { error: string }> {
  if (venueSlugHint) return { slug: venueSlugHint };

  const { data, error } = await supabase
    .from("venues")
    .select("slug, name")
    .ilike("name", venueName);

  if (error) return { error: error.message };

  const exact = (data ?? []).find(
    (venue) => venue.name.toLowerCase() === venueName.toLowerCase(),
  );
  if (exact) return { slug: exact.slug as string };

  if (!createDetails?.citySlug) {
    return {
      error: `Venue "${venueName}" was not found. Select a city below to add it automatically.`,
    };
  }

  const city = ALL_CITIES.find((item) => item.slug === createDetails.citySlug);
  if (!city) return { error: "Select a valid city for the new venue." };

  const slug = slugify(venueName);
  const address = createDetails.address || `${venueName}, ${city.name}`;
  const capacity =
    createDetails.capacity > 0 ? createDetails.capacity : 500;

  const { error: insertError } = await supabase.from("venues").upsert({
    slug,
    name: venueName,
    city: city.name,
    province: city.province,
    address,
    capacity,
    image: DEFAULT_VENUE_IMAGE,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/organizer/venues");
  revalidatePath("/venues");

  return { slug };
}

async function resolveArtistSlugs(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  names: string[],
  slugHints: string[],
): Promise<{ slugs: string[] } | { error: string }> {
  const slugs: string[] = [];

  for (let index = 0; index < names.length; index += 1) {
    const name = names[index]?.trim();
    if (!name) continue;

    const hint = slugHints[index]?.trim();
    if (hint) {
      slugs.push(hint);
      continue;
    }

    const { data, error } = await supabase
      .from("artists")
      .select("slug, name")
      .ilike("name", name);

    if (error) return { error: error.message };

    const exact = (data ?? []).find(
      (artist) => artist.name.toLowerCase() === name.toLowerCase(),
    );

    if (exact) {
      slugs.push(exact.slug as string);
      continue;
    }

    const slug = slugify(name);
    const { error: insertError } = await supabase.from("artists").upsert({
      slug,
      name,
      genre: "pop" satisfies Genre,
      image: DEFAULT_ARTIST_IMAGE,
    });

    if (insertError) return { error: insertError.message };
    slugs.push(slug);
  }

  return { slugs };
}

async function resolveEventEntities(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  parsed: ParsedEventForm,
): Promise<ParsedEventForm | { error: string }> {
  const venueResolved = await resolveVenueSlug(
    supabase,
    parsed.venueName,
    parsed.venueSlug,
    parsed.venueSlug
      ? undefined
      : {
          citySlug: parsed.venueCitySlug,
          address: parsed.venueAddress,
          capacity: parsed.venueCapacity,
        },
  );
  if ("error" in venueResolved) return venueResolved;

  const artistsResolved = await resolveArtistSlugs(
    supabase,
    parsed.artistNames,
    parsed.artistSlugs,
  );
  if ("error" in artistsResolved) return artistsResolved;

  return {
    ...parsed,
    venueSlug: venueResolved.slug,
    artistSlugs: artistsResolved.slugs,
  };
}

function eventTimesFromForm(parsed: ParsedEventForm) {
  const showTime = sastToIso(parsed.showDateTime);
  const date = showTime;
  const doorsDate = new Date(showTime);
  doorsDate.setMinutes(doorsDate.getMinutes() - parsed.doorsMinutes);
  const doorsTime = doorsDate.toISOString();
  const endDate = parsed.endDateTime ? sastToIso(parsed.endDateTime) : null;
  return { showTime, date, doorsTime, endDate };
}

function revalidateEventPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
  revalidatePath("/organizer/events");
  revalidatePath(`/organizer/events/${slug}/edit`);
}

function eventRowWithoutOrganizer(
  parsed: ParsedEventForm,
  image: string,
  times: ReturnType<typeof eventTimesFromForm>,
) {
  const { showTime, date, doorsTime, endDate } = times;
  return {
    slug: parsed.slug,
    title: parsed.title,
    subtitle: parsed.subtitle,
    description: parsed.description,
    image,
    date,
    end_date: endDate,
    doors_time: doorsTime,
    show_time: showTime,
    genre: parsed.category,
    featured: parsed.featured,
    venue_slug: parsed.venueSlug,
    age_limit: parsed.ageLimit,
    age_max: parsed.ageMax,
    tags: parsed.tags,
    organizer_id: parsed.organizerId,
    show_organizer_profile: parsed.showOrganizerProfile,
    prohibited_items: parsed.prohibitedItems,
    ...(parsed.contactEmail != null
      ? { contact_email: parsed.contactEmail }
      : {}),
    ...(parsed.refundPolicy !== undefined
      ? { refund_policy: parsed.refundPolicy }
      : {}),
  };
}

function eventRowWithOrganizer(
  parsed: ParsedEventForm,
  image: string,
  times: ReturnType<typeof eventTimesFromForm>,
  organizerLogo: string | null,
) {
  return {
    ...eventRowWithoutOrganizer(parsed, image, times),
    organizer_name: parsed.organizerName,
    organizer_logo: organizerLogo,
  };
}

async function insertEventRow(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  parsed: ParsedEventForm,
  image: string,
  times: ReturnType<typeof eventTimesFromForm>,
  organizerLogo: string | null,
): Promise<{ error?: string; organizerSkipped?: boolean }> {
  const withOrganizer = eventRowWithOrganizer(parsed, image, times, organizerLogo);
  const { error } = await supabase.from("events").insert(withOrganizer);

  if (!error) return {};

  if (isMissingColumnError(error)) {
    const { error: fallbackError } = await supabase
      .from("events")
      .insert(eventRowWithoutOrganizer(parsed, image, times));

    if (!fallbackError) {
      return {
        organizerSkipped: Boolean(parsed.organizerName || organizerLogo),
      };
    }
    return { error: fallbackError.message };
  }

  return { error: error.message };
}

async function updateEventRow(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  slug: string,
  parsed: ParsedEventForm,
  image: string,
  times: ReturnType<typeof eventTimesFromForm>,
  organizerLogo: string | null,
): Promise<{ error?: string; organizerSkipped?: boolean }> {
  const withOrganizer = {
    title: parsed.title,
    subtitle: parsed.subtitle,
    description: parsed.description,
    image,
    date: times.date,
    end_date: times.endDate,
    doors_time: times.doorsTime,
    show_time: times.showTime,
    genre: parsed.category,
    featured: parsed.featured,
    venue_slug: parsed.venueSlug,
    age_limit: parsed.ageLimit,
    age_max: parsed.ageMax,
    tags: parsed.tags,
    organizer_name: parsed.organizerName,
    organizer_logo: organizerLogo,
    organizer_id: parsed.organizerId,
    show_organizer_profile: parsed.showOrganizerProfile,
    prohibited_items: parsed.prohibitedItems,
    ...(parsed.contactEmail != null
      ? { contact_email: parsed.contactEmail }
      : {}),
    ...(parsed.refundPolicy !== undefined
      ? { refund_policy: parsed.refundPolicy }
      : {}),
  };

  const { error } = await supabase.from("events").update(withOrganizer).eq("slug", slug);

  if (!error) return {};

  if (isMissingColumnError(error)) {
    const { error: fallbackError } = await supabase
      .from("events")
      .update({
        title: parsed.title,
        subtitle: parsed.subtitle,
        description: parsed.description,
        image,
        date: times.date,
        end_date: times.endDate,
        doors_time: times.doorsTime,
        show_time: times.showTime,
        genre: parsed.category,
        featured: parsed.featured,
        venue_slug: parsed.venueSlug,
        age_limit: parsed.ageLimit,
        age_max: parsed.ageMax,
        tags: parsed.tags,
        organizer_id: parsed.organizerId,
        prohibited_items: parsed.prohibitedItems,
        contact_email: parsed.contactEmail,
      })
      .eq("slug", slug);

    if (!fallbackError) {
      return {
        organizerSkipped: Boolean(parsed.organizerName || organizerLogo),
      };
    }
    return { error: fallbackError.message };
  }

  return { error: error.message };
}

async function loadExistingEventImage(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  slug: string,
): Promise<
  | { ok: true; image: string; organizerLogo: string | null }
  | { ok: false; error: string }
> {
  const withLogo = await supabase
    .from("events")
    .select("image, organizer_logo")
    .eq("slug", slug)
    .maybeSingle();

  if (!withLogo.error && withLogo.data) {
    return {
      ok: true,
      image: withLogo.data.image as string,
      organizerLogo: (withLogo.data.organizer_logo as string | null) ?? null,
    };
  }

  if (withLogo.error && isMissingColumnError(withLogo.error)) {
    const fallback = await supabase
      .from("events")
      .select("image")
      .eq("slug", slug)
      .maybeSingle();

    if (fallback.error || !fallback.data) {
      return { ok: false, error: fallback.error?.message ?? "Event not found." };
    }

    return {
      ok: true,
      image: fallback.data.image as string,
      organizerLogo: null,
    };
  }

  return {
    ok: false,
    error: withLogo.error?.message ?? "Event not found.",
  };
}

export async function createEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireOrganizerSession();
  if ("error" in auth) return auth;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local, run the migration, and seed venues/artists.",
    };
  }

  const parsedRaw = parseEventForm(formData, { requirePoster: true });
  if ("error" in parsedRaw) return parsedRaw;

  if (formData.get("acceptTerms") !== "on") {
    return { error: "Accept the terms to publish your event." };
  }

  const session = auth;
  const profile = await getOrganizerByEmail(session.email);

  const parsedWithOrganizer: ParsedEventForm = {
    ...parsedRaw,
    organizerId: profile?.id ?? session.id ?? null,
    organizerName:
      parsedRaw.organizerName ?? profile?.name ?? session.name ?? null,
    contactEmail:
      parsedRaw.contactEmail ?? profile?.email ?? session.email ?? null,
    refundPolicy: null,
  };

  const parsed = await resolveEventEntities(supabase, parsedWithOrganizer);
  if ("error" in parsed) return parsed;

  const { showTime, date, doorsTime, endDate } = eventTimesFromForm(parsed);
  const times = { showTime, date, doorsTime, endDate };

  const { data: existing } = await supabase
    .from("events")
    .select("slug")
    .eq("slug", parsed.slug)
    .maybeSingle();

  if (existing) {
    return { error: `An event with slug "${parsed.slug}" already exists.` };
  }

  let image: string;
  try {
    image = await uploadEventPoster(supabase, parsed.slug, parsed.posterFile!);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload poster.";
    if (message.includes("Bucket not found")) {
      return {
        error:
          'Storage bucket missing. Run supabase/migrations/0002_event_posters_storage.sql in the Supabase SQL editor.',
      };
    }
    return { error: message };
  }

  let organizerLogo: string | null = profile?.logo ?? null;
  if (parsed.organizerLogoFile) {
    try {
      organizerLogo = await uploadOrganizerLogo(
        supabase,
        parsed.slug,
        parsed.organizerLogoFile,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload organizer logo.";
      return { error: message };
    }
  }

  const insertResult = await insertEventRow(
    supabase,
    parsed,
    image,
    times,
    organizerLogo,
  );

  if (insertResult.error) {
    return { error: insertResult.error };
  }

  const organizerSkipped = insertResult.organizerSkipped;

  const { error: tiersError } = await supabase.from("ticket_tiers").insert(
    parsed.tiers.map((t) => ({
      event_slug: parsed.slug,
      id: t.id,
      name: t.name,
      price: t.price,
      description: t.description,
      capacity: t.capacity,
      sold: 0,
      position: t.position,
    })),
  );

  if (tiersError) {
    await supabase.from("events").delete().eq("slug", parsed.slug);
    return { error: tiersError.message };
  }

  if (parsed.artistSlugs.length > 0) {
    const { error: artistsError } = await supabase.from("event_artists").insert(
      parsed.artistSlugs.map((artist_slug, position) => ({
        event_slug: parsed.slug,
        artist_slug,
        position,
      })),
    );

    if (artistsError) {
      await supabase.from("events").delete().eq("slug", parsed.slug);
      return { error: artistsError.message };
    }
  }

  revalidateEventPaths(parsed.slug);
  if (organizerSkipped) {
    redirect(
      `/organizer/events/${parsed.slug}/edit?organizerMigration=1`,
    );
  }
  redirect(`/events/${parsed.slug}?created=1`);
}

export async function updateEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const originalSlug = String(formData.get("originalSlug") ?? "").trim();
  if (!originalSlug) return { error: "Missing event identifier." };

  const ownEvent = await requireOwnEvent(originalSlug);
  if ("error" in ownEvent) return ownEvent;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    };
  }

  const parsedRaw = parseEventForm(formData, { requirePoster: false });
  if ("error" in parsedRaw) return parsedRaw;

  const { session } = ownEvent;
  const profile = await getOrganizerByEmail(session.email);
  const parsedWithOrganizer: ParsedEventForm = {
    ...parsedRaw,
    organizerId: profile?.id ?? session.id ?? null,
    contactEmail:
      parsedRaw.contactEmail ?? profile?.email ?? session.email ?? null,
  };

  const parsed = await resolveEventEntities(supabase, parsedWithOrganizer);
  if ("error" in parsed) return parsed;

  if (parsed.slug !== originalSlug) {
    return { error: "Event URL slug cannot be changed after publishing." };
  }

  const existing = await loadExistingEventImage(supabase, originalSlug);
  if (!existing.ok) {
    return { error: existing.error };
  }

  const { showTime, date, doorsTime, endDate } = eventTimesFromForm(parsed);
  const times = { showTime, date, doorsTime, endDate };

  let image = existing.image;
  if (parsed.posterFile) {
    try {
      image = await uploadEventPoster(supabase, parsed.slug, parsed.posterFile);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload poster.";
      if (message.includes("Bucket not found")) {
        return {
          error:
            'Storage bucket missing. Run supabase/migrations/0002_event_posters_storage.sql in the Supabase SQL editor.',
        };
      }
      return { error: message };
    }
  }

  let organizerLogo = existing.organizerLogo;
  if (parsed.organizerLogoFile) {
    try {
      organizerLogo = await uploadOrganizerLogo(
        supabase,
        parsed.slug,
        parsed.organizerLogoFile,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload organizer logo.";
      return { error: message };
    }
  }

  const { data: existingTiers } = await supabase
    .from("ticket_tiers")
    .select("id, sold")
    .eq("event_slug", originalSlug);

  const soldById = new Map(
    (existingTiers ?? []).map((tier) => [tier.id as string, Number(tier.sold ?? 0)]),
  );

  for (const tier of parsed.tiers) {
    const sold = soldById.get(tier.id) ?? 0;
    if (sold > tier.capacity) {
      return {
        error: `"${tier.name}" has ${sold} tickets sold — capacity cannot be below that.`,
      };
    }
  }

  const updateResult = await updateEventRow(
    supabase,
    originalSlug,
    parsed,
    image,
    times,
    organizerLogo,
  );

  if (updateResult.error) {
    return { error: updateResult.error };
  }

  const { error: deleteTiersError } = await supabase
    .from("ticket_tiers")
    .delete()
    .eq("event_slug", originalSlug);

  if (deleteTiersError) {
    return { error: deleteTiersError.message };
  }

  const { error: tiersError } = await supabase.from("ticket_tiers").insert(
    parsed.tiers.map((t) => ({
      event_slug: originalSlug,
      id: t.id,
      name: t.name,
      price: t.price,
      description: t.description,
      capacity: t.capacity,
      sold: soldById.get(t.id) ?? 0,
      position: t.position,
    })),
  );

  if (tiersError) {
    return { error: tiersError.message };
  }

  const { error: deleteArtistsError } = await supabase
    .from("event_artists")
    .delete()
    .eq("event_slug", originalSlug);

  if (deleteArtistsError) {
    return { error: deleteArtistsError.message };
  }

  if (parsed.artistSlugs.length > 0) {
    const { error: artistsError } = await supabase.from("event_artists").insert(
      parsed.artistSlugs.map((artist_slug, position) => ({
        event_slug: originalSlug,
        artist_slug,
        position,
      })),
    );

    if (artistsError) {
      return { error: artistsError.message };
    }
  }

  revalidateEventPaths(originalSlug);
  if (updateResult.organizerSkipped) {
    redirect(`/organizer/events/${originalSlug}/edit?organizerMigration=1`);
  }
  redirect(`/events/${originalSlug}?updated=1`);
}

export async function deleteEvent(slug: string): Promise<ActionState> {
  const ownEvent = await requireOwnEvent(slug);
  if ("error" in ownEvent) return ownEvent;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data: existing } = await supabase
    .from("events")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!existing) {
    return { error: "Event not found." };
  }

  const { error } = await supabase.from("events").delete().eq("slug", slug);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/organizer/events");
  redirect("/organizer/events?deleted=1");
}

export async function toggleEventFeatured(
  slug: string,
  featured: boolean,
): Promise<ActionState> {
  const ownEvent = await requireOwnEvent(slug);
  if ("error" in ownEvent) return ownEvent;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase
    .from("events")
    .update({ featured })
    .eq("slug", slug);

  if (error) {
    return { error: error.message };
  }

  revalidateEventPaths(slug);
  return { success: featured ? "Event featured on homepage." : "Removed from homepage carousel." };
}

export async function getOrganizerAuthStatus(): Promise<{
  supabaseReady: boolean;
}> {
  return {
    supabaseReady: getSupabaseAdmin() !== null,
  };
}

export type CheckInResult = {
  ok: boolean;
  error?: string;
  ticket?: {
    code: string;
    holderName: string;
    tierName: string;
    buyerEmail: string;
    status: string;
  };
};

export async function checkInEventTicket(
  code: string,
  eventSlug: string,
): Promise<CheckInResult> {
  const ownEvent = await requireOwnEvent(eventSlug);
  if ("error" in ownEvent) {
    return { ok: false, error: ownEvent.error };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const normalized = code.trim().toUpperCase();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();

  if (!ticket) {
    return { ok: false, error: "Ticket not found." };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("buyer_email")
    .eq("id", ticket.order_id)
    .maybeSingle();

  const buyerEmail = (order?.buyer_email as string) ?? "";

  if (ticket.event_slug !== eventSlug) {
    return { ok: false, error: "This ticket is for a different event." };
  }

  if (ticket.status === "used") {
    return {
      ok: false,
      error: "Already checked in.",
      ticket: {
        code: ticket.code as string,
        holderName: ticket.holder_name as string,
        tierName: ticket.tier_name as string,
        buyerEmail,
        status: "used",
      },
    };
  }

  if (ticket.status !== "valid") {
    return { ok: false, error: "Ticket is not valid." };
  }

  const { error } = await supabase
    .from("tickets")
    .update({
      status: "used",
      checked_in_at: new Date().toISOString(),
    })
    .eq("code", normalized);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/tickets/verify/${normalized}`);
  revalidatePath(`/organizer/events/${eventSlug}/tickets`);
  revalidatePath(`/organizer/events/${eventSlug}/scan`);

  return {
    ok: true,
    ticket: {
      code: ticket.code as string,
      holderName: ticket.holder_name as string,
      tierName: ticket.tier_name as string,
      buyerEmail,
      status: "used",
    },
  };
}

function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function createVenue(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireOrganizerSession();
  if ("error" in auth) return auth;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugify(name);
  const citySlug = String(formData.get("citySlug") ?? "");
  const address = String(formData.get("address") ?? "").trim();
  const capacity = Number(formData.get("capacity") ?? 0);
  const imageInput = String(formData.get("image") ?? "").trim();

  const city = ALL_CITIES.find((c) => c.slug === citySlug);
  if (!name) return { error: "Venue name is required." };
  if (!slug) return { error: "URL slug is required." };
  if (!city) return { error: "Select a city." };
  if (!address) return { error: "Address is required." };
  if (!capacity || capacity <= 0) return { error: "Capacity must be greater than 0." };
  if (imageInput && !isValidHttpsUrl(imageInput)) {
    return { error: "Image must be a valid http(s) URL." };
  }

  const { data: existing } = await supabase
    .from("venues")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return { error: `A venue with slug "${slug}" already exists.` };
  }

  const { error } = await supabase.from("venues").insert({
    slug,
    name,
    city: city.name,
    province: city.province,
    address,
    capacity,
    image: imageInput || DEFAULT_VENUE_IMAGE,
  });

  if (error) return { error: error.message };

  revalidatePath("/organizer/venues");
  revalidatePath("/venues");
  revalidatePath(`/venues/${slug}`);
  revalidatePath("/organizer/events/new");
  redirect("/organizer/venues?created=1");
}

export async function createArtist(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireOrganizerSession();
  if ("error" in auth) return auth;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugify(name);
  const genre = String(formData.get("genre") ?? "") as Genre;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const imageInput = String(formData.get("image") ?? "").trim();

  if (!name) return { error: "Artist name is required." };
  if (!slug) return { error: "URL slug is required." };
  if (!GENRES.some((g) => g.id === genre)) return { error: "Select a genre." };
  if (imageInput && !isValidHttpsUrl(imageInput)) {
    return { error: "Image must be a valid http(s) URL." };
  }

  const { data: existing } = await supabase
    .from("artists")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return { error: `An artist with slug "${slug}" already exists.` };
  }

  const { error } = await supabase.from("artists").insert({
    slug,
    name,
    genre,
    bio,
    image: imageInput || DEFAULT_ARTIST_IMAGE,
  });

  if (error) return { error: error.message };

  revalidatePath("/organizer/artists");
  revalidatePath("/artists");
  revalidatePath(`/artists/${slug}`);
  revalidatePath("/organizer/events/new");
  redirect("/organizer/artists?created=1");
}

function validateOptionalLogoFile(file: File): string | null {
  if (!file.size) return null;
  return validateOrganizerLogoFile(file);
}

export async function updateOrganizerProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error:
        "Supabase is not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    };
  }

  const session = await getOrganizerSession();
  if (!session) return { error: "You must be signed in to update your profile." };

  const profile = await getOrganizerByEmail(session.email);
  if (!profile) {
    return {
      error:
        "Organizer profile not found. Run migration 0008_organizer_profiles.sql.",
    };
  }

  const name = String(formData.get("name") ?? "").trim() || null;
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug =
    slugInput ||
    profile.slug ||
    suggestOrganizerSlug(name, session.email);
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim() || null;
  const instagramUrl = String(formData.get("instagramUrl") ?? "").trim() || null;
  const invoiceCompanyName =
    String(formData.get("invoiceCompanyName") ?? "").trim() || null;
  const invoiceAddressLine1 =
    String(formData.get("invoiceAddressLine1") ?? "").trim() || null;
  const invoiceAddressLine2 =
    String(formData.get("invoiceAddressLine2") ?? "").trim() || null;
  const invoiceCity = String(formData.get("invoiceCity") ?? "").trim() || null;
  const invoiceProvince =
    String(formData.get("invoiceProvince") ?? "").trim() || null;
  const invoicePostalCode =
    String(formData.get("invoicePostalCode") ?? "").trim() || null;
  const vatNumber = String(formData.get("vatNumber") ?? "").trim() || null;
  const defaultRefundPolicy =
    String(formData.get("defaultRefundPolicy") ?? "").trim() || null;

  if (!slug) return { error: "Public URL slug is required." };

  if (slug !== profile.slug && (await isOrganizerSlugTaken(slug, profile.id))) {
    return { error: `The slug "${slug}" is already taken. Choose another.` };
  }

  const logoRaw = formData.get("logo");
  const logoFile =
    logoRaw instanceof File && logoRaw.size > 0 ? logoRaw : null;
  if (logoFile) {
    const logoError = validateOptionalLogoFile(logoFile);
    if (logoError) return { error: logoError };
  }

  let logo = profile.logo;
  if (logoFile) {
    try {
      logo = await uploadProfileOrganizerLogo(supabase, slug, logoFile);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload logo.";
      return { error: message };
    }
  }

  const update: OrganizerProfileUpdate = {
    name,
    slug,
    bio,
    phone,
    websiteUrl,
    instagramUrl,
    invoiceCompanyName,
    invoiceAddressLine1,
    invoiceAddressLine2,
    invoiceCity,
    invoiceProvince,
    invoicePostalCode,
    vatNumber,
    defaultRefundPolicy,
    logo,
  };

  const { error } = await supabase
    .from("organizers")
    .update(profileToDbRow(update))
    .eq("id", profile.id);

  if (error) {
    if (isMissingColumnError(error)) {
      return {
        error:
          "Run supabase/migrations/0008_organizer_profiles.sql in the Supabase SQL editor.",
      };
    }
    return { error: error.message };
  }

  await setOrganizerSession({
    ...session,
    name: name ?? session.name,
    slug,
  });

  revalidatePath("/organizer/profile");
  revalidatePath("/organizer/profile/edit");
  if (profile.slug) revalidatePath(`/organizers/${profile.slug}`);
  revalidatePath(`/organizers/${slug}`);
  redirect("/organizer/profile?saved=1");
}

export async function issueCompTickets(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const eventSlug = String(formData.get("eventSlug") ?? "").trim();
  const holderName = String(formData.get("holderName") ?? "").trim();
  const holderEmail = String(formData.get("holderEmail") ?? "")
    .trim()
    .toLowerCase();
  const tierId = String(formData.get("tierId") ?? "").trim();
  const qty = Number(formData.get("qty") ?? 1);

  const ownEvent = await requireOwnEvent(eventSlug);
  if ("error" in ownEvent) {
    return { error: ownEvent.error };
  }

  if (!holderName) {
    return { error: "Guest name is required." };
  }
  if (!holderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(holderEmail)) {
    return { error: "A valid guest email is required." };
  }
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
    return { error: "Issue between 1 and 10 tickets at a time." };
  }

  const tier = ownEvent.event.tiers.find((t) => t.id === tierId);
  if (!tier) {
    return { error: "Select a valid ticket tier." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error:
        "Comp tickets require Supabase. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    };
  }

  const orderPayload: Record<string, unknown> = {
    event_slug: eventSlug,
    buyer_name: holderName,
    buyer_email: holderEmail,
    subtotal_amount: 0,
    service_fee: 0,
    total_amount: 0,
    ticket_count: qty,
    status: "confirmed",
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Could not create comp order." };
  }

  const fulfilled = await fulfillTicketOrder(
    supabase,
    order.id as string,
    eventSlug,
    holderName,
    [
      {
        tierId: tier.id,
        tierName: tier.name,
        qty,
        price: 0,
      },
    ],
  );

  if (!fulfilled.ok) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: fulfilled.error };
  }

  revalidatePath(`/organizer/events/${eventSlug}/tickets`);
  revalidatePath(`/events/${eventSlug}`);

  return {
    success: `Issued ${qty} comp ticket${qty === 1 ? "" : "s"} for ${holderName}.`,
  };
}

export async function createPromoCode(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const eventSlug = String(formData.get("eventSlug") ?? "").trim();
  const code = normalizePromoCode(String(formData.get("code") ?? ""));
  const discountType = String(formData.get("discountType") ?? "percent");
  const discountValue = Number(formData.get("discountValue"));
  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

  const ownEvent = await requireOwnEvent(eventSlug);
  if ("error" in ownEvent) return { error: ownEvent.error };

  if (!code || code.length < 3) {
    return { error: "Promo code must be at least 3 characters." };
  }
  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return {
      error: "Use letters, numbers, hyphens, or underscores only.",
    };
  }
  if (discountType !== "percent" && discountType !== "fixed") {
    return { error: "Invalid discount type." };
  }
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { error: "Enter a valid discount value." };
  }
  if (discountType === "percent" && discountValue > 100) {
    return { error: "Percentage discount cannot exceed 100%." };
  }

  const maxUses = maxUsesRaw ? Number(maxUsesRaw) : null;
  if (maxUsesRaw && (!Number.isInteger(maxUses) || maxUses! < 1)) {
    return { error: "Max uses must be a positive whole number." };
  }

  const expiresAt = expiresAtRaw ? sastToIso(expiresAtRaw) : null;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { error: "Promo codes require Supabase." };
  }

  const { error } = await supabase.from("promo_codes").insert({
    event_slug: eventSlug,
    code,
    discount_type: discountType,
    discount_value: discountValue,
    max_uses: maxUses,
    expires_at: expiresAt,
    active: true,
  });

  if (error) {
    if (error.message.includes("promo_codes")) {
      return {
        error:
          "Run supabase/migrations/0012_promo_codes.sql in the Supabase SQL editor.",
      };
    }
    if (error.message.includes("duplicate")) {
      return { error: "This code already exists for this event." };
    }
    return { error: error.message };
  }

  revalidatePath(`/organizer/events/${eventSlug}/promos`);
  return { success: `Promo code ${code} created.` };
}

export async function togglePromoCodeActive(formData: FormData): Promise<void> {
  const eventSlug = String(formData.get("eventSlug") ?? "").trim();
  const promoId = String(formData.get("promoId") ?? "").trim();
  const active = String(formData.get("active") ?? "") === "true";

  const ownEvent = await requireOwnEvent(eventSlug);
  if ("error" in ownEvent) return;

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await supabase
    .from("promo_codes")
    .update({ active })
    .eq("id", promoId)
    .eq("event_slug", eventSlug);

  revalidatePath(`/organizer/events/${eventSlug}/promos`);
}
