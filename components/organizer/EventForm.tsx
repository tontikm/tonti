"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Artist, EventCategory, Venue } from "@/lib/types";
import { EVENT_CATEGORIES } from "@/lib/data/categories";
import { getSafeEventImageUrl, getSafeOrganizerLogoUrl } from "@/lib/images";
import { Button } from "@/components/ui/Button";
import type { ActionState } from "@/app/organizer/actions";
import { isoToSastDateAndTime, slugify } from "@/lib/utils";
import { EventDateTimeFields } from "@/components/organizer/EventDateTimeFields";
import { EntityTypeahead } from "@/components/organizer/EntityTypeahead";
import { LineupInput } from "@/components/organizer/LineupInput";
import { NewVenueFields } from "@/components/organizer/NewVenueFields";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { ProhibitedItemsInput } from "@/components/organizer/ProhibitedItemsInput";

type TierRow = {
  key: string;
  id: string;
  name: string;
  price: string;
  capacity: string;
  description: string;
};

export type EventFormInitial = {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  organizerName?: string;
  organizerLogo?: string;
  showDate: string;
  showTime: string;
  endDate?: string;
  doorsMinutes: number;
  category: EventCategory;
  venueName: string;
  venueSlug: string;
  artistNames: string[];
  artistSlugs: string[];
  ageLimit?: number;
  tags: string[];
  featured: boolean;
  prohibitedItems?: string[];
  contactEmail?: string;
  refundPolicy?: string;
  tiers: {
    id: string;
    name: string;
    price: number;
    capacity: number;
    description?: string;
  }[];
};

type EventFormProps = {
  venues: Venue[];
  artists: Artist[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel?: string;
  initial?: EventFormInitial;
};

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export function EventForm({
  venues,
  artists,
  action,
  submitLabel = "Publish event",
  initial,
}: EventFormProps) {
  const isEdit = Boolean(initial);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {},
  );

  const defaultShow = initial
    ? { date: initial.showDate, time: initial.showTime }
    : isoToSastDateAndTime(new Date().toISOString());

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [showDate, setShowDate] = useState(defaultShow.date);
  const [showTime, setShowTime] = useState(defaultShow.time);
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [doorsMinutes, setDoorsMinutes] = useState(
    String(initial?.doorsMinutes ?? 60),
  );
  const [category, setCategory] = useState<EventCategory | "">(
    initial?.category ?? "",
  );
  const [venueName, setVenueName] = useState(initial?.venueName ?? "");
  const [venueSlug, setVenueSlug] = useState(initial?.venueSlug ?? "");
  const [venueCitySlug, setVenueCitySlug] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("500");
  const [ageLimit, setAgeLimit] = useState(
    initial?.ageLimit != null ? String(initial.ageLimit) : "",
  );
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [prohibitedItems, setProhibitedItems] = useState<string[]>(
    initial?.prohibitedItems ?? [],
  );
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? "");
  const [refundPolicy, setRefundPolicy] = useState(initial?.refundPolicy ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [tiers, setTiers] = useState<TierRow[]>(() =>
    initial?.tiers.length
      ? initial.tiers.map((tier, index) => ({
          key: tier.id || String(index),
          id: tier.id,
          name: tier.name,
          price: String(tier.price),
          capacity: String(tier.capacity),
          description: tier.description ?? "",
        }))
      : [
          {
            key: "1",
            id: "",
            name: "General Admission",
            price: "250",
            capacity: "500",
            description: "",
          },
        ],
  );
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [organizerName, setOrganizerName] = useState(initial?.organizerName ?? "");
  const [organizerLogoPreview, setOrganizerLogoPreview] = useState<string | null>(
    null,
  );
  const currentPoster = posterPreview ?? (initial ? getSafeEventImageUrl(initial.image) : null);
  const currentOrganizerLogo =
    organizerLogoPreview ??
    (initial?.organizerLogo
      ? getSafeOrganizerLogoUrl(initial.organizerLogo)
      : null);

  const venueOptions = useMemo(
    () =>
      venues.map((venue) => ({
        slug: venue.slug,
        label: venue.name,
        sublabel: `${venue.city}, ${venue.province}`,
      })),
    [venues],
  );

  const artistOptions = useMemo(
    () =>
      artists.map((artist) => ({
        slug: artist.slug,
        label: artist.name,
      })),
    [artists],
  );

  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview);
    };
  }, [posterPreview]);

  useEffect(() => {
    return () => {
      if (organizerLogoPreview) URL.revokeObjectURL(organizerLogoPreview);
    };
  }, [organizerLogoPreview]);

  function onPosterChange(file: File | undefined) {
    if (posterPreview) URL.revokeObjectURL(posterPreview);
    if (!file) {
      setPosterPreview(null);
      return;
    }
    setPosterPreview(URL.createObjectURL(file));
  }

  function onOrganizerLogoChange(file: File | undefined) {
    if (organizerLogoPreview) URL.revokeObjectURL(organizerLogoPreview);
    if (!file) {
      setOrganizerLogoPreview(null);
      return;
    }
    setOrganizerLogoPreview(URL.createObjectURL(file));
  }

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function addTier() {
    setTiers((prev) => [
      ...prev,
      {
        key: String(Date.now()),
        id: "",
        name: "",
        price: "0",
        capacity: "100",
        description: "",
      },
    ]);
  }

  function removeTier(key: string) {
    setTiers((prev) => (prev.length <= 1 ? prev : prev.filter((t) => t.key !== key)));
  }

  function updateTier(key: string, field: keyof TierRow, value: string) {
    setTiers((prev) =>
      prev.map((t) => (t.key === key ? { ...t, [field]: value } : t)),
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {isEdit && (
        <input type="hidden" name="originalSlug" value={initial!.slug} />
      )}

      {state.error && (
        <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-foreground">
          {state.error}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Event details</h2>

        <div>
          <label htmlFor="title" className={labelClass}>
            Event title *
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={inputClass}
            placeholder="Amapiano Festival"
          />
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            URL slug *
          </label>
          <input
            id="slug"
            name="slug"
            required
            readOnly={isEdit}
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value);
            }}
            className={`${inputClass} ${isEdit ? "cursor-not-allowed opacity-70" : ""}`}
            placeholder="amapiano-festival-jhb"
          />
          <p className="mt-1 text-xs text-muted">
            tonti.co.za/events/{slug || "your-event-slug"}
            {isEdit && " · slug cannot be changed"}
          </p>
        </div>

        <div>
          <label htmlFor="subtitle" className={labelClass}>
            Subtitle
          </label>
          <input
            id="subtitle"
            name="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={inputClass}
            placeholder="Two days of log-drum heaven"
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            placeholder="Tell fans what to expect…"
          />
        </div>

        <div>
          <label htmlFor="poster" className={labelClass}>
            Event poster {isEdit ? "" : "*"}
          </label>
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-4">
            {currentPoster ? (
              <div className="relative mb-4 aspect-[16/9] max-h-56 overflow-hidden rounded-xl border border-border">
                <Image
                  src={currentPoster}
                  alt="Poster preview"
                  fill
                  className="object-cover"
                  unoptimized={Boolean(posterPreview)}
                />
              </div>
            ) : (
              <div className="mb-4 flex aspect-[16/9] max-h-56 items-center justify-center rounded-xl border border-border bg-surface text-muted">
                <div className="text-center">
                  <ImagePlus className="mx-auto h-8 w-8" />
                  <p className="mt-2 text-sm">Upload a poster image</p>
                </div>
              </div>
            )}
            <input
              id="poster"
              name="poster"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required={!isEdit}
              onChange={(e) => onPosterChange(e.target.files?.[0])}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-foreground hover:file:bg-accent-hover"
            />
            <p className="mt-2 text-xs text-muted">
              JPG, PNG, WebP, or GIF · max 5 MB · recommended 1200×630 or larger
              {isEdit && " · leave empty to keep the current poster"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="organizerName" className={labelClass}>
              Organizer name
            </label>
            <input
              id="organizerName"
              name="organizerName"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              className={inputClass}
              placeholder="Piano Nation SA"
            />
            <p className="mt-1 text-xs text-muted">
              Shown in the site header on your event page when a logo is uploaded.
            </p>
          </div>

          <div>
            <label htmlFor="organizerLogo" className={labelClass}>
              Organizer logo
            </label>
            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-4">
              {currentOrganizerLogo ? (
                <div className="relative mb-4 flex h-20 items-center justify-start overflow-hidden rounded-xl border border-border bg-black px-4">
                  <Image
                    src={currentOrganizerLogo}
                    alt="Organizer logo preview"
                    width={160}
                    height={64}
                    className="max-h-12 w-auto object-contain"
                    unoptimized={Boolean(organizerLogoPreview)}
                  />
                </div>
              ) : (
                <div className="mb-4 flex h-20 items-center justify-center rounded-xl border border-border bg-surface text-muted">
                  <div className="text-center">
                    <ImagePlus className="mx-auto h-6 w-6" />
                    <p className="mt-1 text-xs">Upload organizer logo</p>
                  </div>
                </div>
              )}
              <input
                id="organizerLogo"
                name="organizerLogo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => onOrganizerLogoChange(e.target.files?.[0])}
                className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-foreground hover:file:bg-accent-hover"
              />
              <p className="mt-2 text-xs text-muted">
                PNG with transparent background works best · max 5 MB
                {isEdit && " · leave empty to keep the current logo"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Date & venue</h2>

        <EventDateTimeFields
          showDate={showDate}
          showTime={showTime}
          endDate={endDate}
          onShowDateChange={setShowDate}
          onShowTimeChange={setShowTime}
          onEndDateChange={setEndDate}
        />

        <div>
          <label htmlFor="doorsMinutes" className={labelClass}>
            Doors open (minutes before show)
          </label>
          <input
            id="doorsMinutes"
            name="doorsMinutes"
            type="number"
            min={0}
            value={doorsMinutes}
            onChange={(e) => setDoorsMinutes(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className={labelClass}>
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className={inputClass}
            >
              <option value="">Select category</option>
              {EVENT_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <EntityTypeahead
              id="venue"
              label="Venue *"
              placeholder="Start typing a venue name"
              options={venueOptions}
              value={venueName}
              selectedSlug={venueSlug}
              onValueChange={(name) => {
                setVenueName(name);
                setVenueSlug("");
              }}
              onSelect={(option) => setVenueSlug(option?.slug ?? "")}
              required
              helperText="Matches saved venues, or add details below for a new venue."
            />
            <input type="hidden" name="venueName" value={venueName} />
          </div>
        </div>

        {venueName.trim() && !venueSlug && (
          <NewVenueFields
            citySlug={venueCitySlug}
            address={venueAddress}
            capacity={venueCapacity}
            onCityChange={setVenueCitySlug}
            onAddressChange={setVenueAddress}
            onCapacityChange={setVenueCapacity}
          />
        )}

        <LineupInput
          artists={artistOptions}
          initialNames={initial?.artistNames}
          initialSlugs={initial?.artistSlugs}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ageLimit" className={labelClass}>
              Age limit (e.g. 18 for adult events)
            </label>
            <input
              id="ageLimit"
              name="ageLimit"
              type="number"
              min={0}
              value={ageLimit}
              onChange={(e) => setAgeLimit(e.target.value)}
              className={inputClass}
              placeholder="18"
            />
          </div>
          <div>
            <label htmlFor="tags" className={labelClass}>
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={inputClass}
              placeholder="festival, outdoor, amapiano"
            />
            <p className="mt-1 text-xs text-muted">Comma-separated</p>
          </div>
        </div>

        <ProhibitedItemsInput
          items={prohibitedItems}
          onChange={setProhibitedItems}
          includeHiddenFields
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contactEmail" className={labelClass}>
              Day-of contact email
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
              placeholder="promoter@example.com"
            />
          </div>
          <div>
            <label htmlFor="refundPolicy" className={labelClass}>
              Refund policy
            </label>
            <textarea
              id="refundPolicy"
              name="refundPolicy"
              rows={3}
              value={refundPolicy}
              onChange={(e) => setRefundPolicy(e.target.value)}
              className={inputClass}
              placeholder="All sales are final unless the event is cancelled…"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Feature on homepage carousel
        </label>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ticket tiers</h2>
          <button
            type="button"
            onClick={addTier}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add tier
          </button>
        </div>

        <div className="space-y-4">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className="rounded-2xl border border-border bg-surface/50 p-4"
            >
              <input type="hidden" name="tierId" value={tier.id} />
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Tier</span>
                {tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTier(tier.key)}
                    className="text-muted hover:text-foreground"
                    aria-label="Remove tier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="tierName"
                  required
                  value={tier.name}
                  onChange={(e) => updateTier(tier.key, "name", e.target.value)}
                  className={inputClass}
                  placeholder="Tier name"
                />
                <input
                  name="tierPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={tier.price}
                  onChange={(e) => updateTier(tier.key, "price", e.target.value)}
                  className={inputClass}
                  placeholder="Price (ZAR)"
                />
                <input
                  name="tierCapacity"
                  type="number"
                  min={1}
                  required
                  value={tier.capacity}
                  onChange={(e) =>
                    updateTier(tier.key, "capacity", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Capacity"
                />
                <input
                  name="tierDescription"
                  value={tier.description}
                  onChange={(e) =>
                    updateTier(tier.key, "description", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Description (optional)"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="submit" size="lg" className="organizer-accent-btn" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button href="/organizer/events" variant="secondary" size="lg">
          Cancel
        </Button>
      </div>
    </form>
  );
}
