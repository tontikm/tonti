"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import type { OrganizerProfile } from "@/lib/types";
import { getSafeOrganizerLogoUrl } from "@/lib/images";
import { getSiteOrigin } from "@/lib/site";
import { slugify } from "@/lib/utils";
import { updateOrganizerProfile, type ActionState } from "@/app/organizer/actions";
import { Button } from "@/components/ui/Button";
import { ImagePlus } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-foreground/40 focus:outline-none";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

type OrganizerProfileFormProps = {
  profile: OrganizerProfile;
};

export function OrganizerProfileForm({ profile }: OrganizerProfileFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateOrganizerProfile,
    {},
  );

  const [name, setName] = useState(profile.name ?? "");
  const [slug, setSlug] = useState(profile.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(profile.slug));
  const [bio, setBio] = useState(profile.bio ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl ?? "");
  const [invoiceCompanyName, setInvoiceCompanyName] = useState(
    profile.invoiceCompanyName ?? "",
  );
  const [invoiceAddressLine1, setInvoiceAddressLine1] = useState(
    profile.invoiceAddressLine1 ?? "",
  );
  const [invoiceAddressLine2, setInvoiceAddressLine2] = useState(
    profile.invoiceAddressLine2 ?? "",
  );
  const [invoiceCity, setInvoiceCity] = useState(profile.invoiceCity ?? "");
  const [invoiceProvince, setInvoiceProvince] = useState(
    profile.invoiceProvince ?? "",
  );
  const [invoicePostalCode, setInvoicePostalCode] = useState(
    profile.invoicePostalCode ?? "",
  );
  const [vatNumber, setVatNumber] = useState(profile.vatNumber ?? "");
  const [defaultRefundPolicy, setDefaultRefundPolicy] = useState(
    profile.defaultRefundPolicy ?? "",
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const currentLogo =
    logoPreview ??
    (profile.logo ? getSafeOrganizerLogoUrl(profile.logo) : null);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function onNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function onLogoChange(file: File | undefined) {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    if (!file) {
      setLogoPreview(null);
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
  }

  const publicPreview = slug
    ? `${getSiteOrigin()}/organizers/${slug}`
    : `${getSiteOrigin()}/organizers/your-slug`;

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      {state.error && (
        <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Public profile</h2>

        <div>
          <label htmlFor="name" className={labelClass}>
            Display name
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={inputClass}
            placeholder="Piano Nation SA"
          />
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Public URL slug *
          </label>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value);
            }}
            className={inputClass}
            placeholder="piano-nation-sa"
          />
          <p className="mt-1 font-mono text-xs text-muted">{publicPreview}</p>
        </div>

        <div>
          <label htmlFor="bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={inputClass}
            placeholder="Tell fans about your events and brand…"
          />
        </div>

        <div>
          <label htmlFor="logo" className={labelClass}>
            Logo
          </label>
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-4">
            {currentLogo ? (
              <div className="relative mb-4 flex h-20 items-center justify-start overflow-hidden rounded-xl border border-border bg-black px-4">
                <Image
                  src={currentLogo}
                  alt="Logo preview"
                  width={160}
                  height={64}
                  className="max-h-12 w-auto object-contain"
                  unoptimized={Boolean(logoPreview)}
                />
              </div>
            ) : (
              <div className="mb-4 flex h-20 items-center justify-center rounded-xl border border-border bg-surface text-muted">
                <div className="text-center">
                  <ImagePlus className="mx-auto h-6 w-6" />
                  <p className="mt-1 text-xs">Upload logo</p>
                </div>
              </div>
            )}
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => onLogoChange(e.target.files?.[0])}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-foreground hover:file:bg-accent-hover"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="text-sm text-muted">
          Email ({profile.email}) is managed through your account and cannot be changed here.
        </p>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+27 82 123 4567"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">External links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="websiteUrl" className={labelClass}>
              Website
            </label>
            <input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className={inputClass}
              placeholder="https://yourbrand.co.za"
            />
          </div>
          <div>
            <label htmlFor="instagramUrl" className={labelClass}>
              Instagram
            </label>
            <input
              id="instagramUrl"
              name="instagramUrl"
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className={inputClass}
              placeholder="https://instagram.com/yourbrand"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Invoice / billing</h2>
        <div>
          <label htmlFor="invoiceCompanyName" className={labelClass}>
            Company name
          </label>
          <input
            id="invoiceCompanyName"
            name="invoiceCompanyName"
            value={invoiceCompanyName}
            onChange={(e) => setInvoiceCompanyName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="invoiceAddressLine1" className={labelClass}>
            Address line 1
          </label>
          <input
            id="invoiceAddressLine1"
            name="invoiceAddressLine1"
            value={invoiceAddressLine1}
            onChange={(e) => setInvoiceAddressLine1(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="invoiceAddressLine2" className={labelClass}>
            Address line 2
          </label>
          <input
            id="invoiceAddressLine2"
            name="invoiceAddressLine2"
            value={invoiceAddressLine2}
            onChange={(e) => setInvoiceAddressLine2(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="invoiceCity" className={labelClass}>
              City
            </label>
            <input
              id="invoiceCity"
              name="invoiceCity"
              value={invoiceCity}
              onChange={(e) => setInvoiceCity(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="invoiceProvince" className={labelClass}>
              Province
            </label>
            <input
              id="invoiceProvince"
              name="invoiceProvince"
              value={invoiceProvince}
              onChange={(e) => setInvoiceProvince(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="invoicePostalCode" className={labelClass}>
              Postal code
            </label>
            <input
              id="invoicePostalCode"
              name="invoicePostalCode"
              value={invoicePostalCode}
              onChange={(e) => setInvoicePostalCode(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="vatNumber" className={labelClass}>
            VAT number (optional)
          </label>
          <input
            id="vatNumber"
            name="vatNumber"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            className={inputClass}
            placeholder="4123456789"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Default refund policy</h2>
        <p className="text-sm text-muted">
          Pre-fills the refund policy when you create new events.
        </p>
        <textarea
          id="defaultRefundPolicy"
          name="defaultRefundPolicy"
          rows={4}
          value={defaultRefundPolicy}
          onChange={(e) => setDefaultRefundPolicy(e.target.value)}
          className={inputClass}
          placeholder="All sales are final unless the event is cancelled…"
        />
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="submit" size="lg" className="organizer-accent-btn" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
        <Button href="/organizer/profile" variant="secondary" size="lg">
          Cancel
        </Button>
      </div>
    </form>
  );
}
