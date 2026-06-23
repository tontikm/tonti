import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import type { OrganizerProfile } from "@/lib/types";
import { getSafeOrganizerLogoUrl } from "@/lib/images";
import { getSiteOrigin } from "@/lib/site";
import { CopyLinkButton } from "@/components/organizer/CopyLinkButton";
import { Button } from "@/components/ui/Button";

type OrganizerProfileViewProps = {
  profile: OrganizerProfile;
};

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-sm">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-foreground">{value}</p>
    </div>
  );
}

export function OrganizerProfileView({ profile }: OrganizerProfileViewProps) {
  const publicUrl = profile.slug
    ? `${getSiteOrigin()}/organizers/${profile.slug}`
    : null;
  const logoUrl = profile.logo ? getSafeOrganizerLogoUrl(profile.logo) : null;

  const addressLines = [
    profile.invoiceAddressLine1,
    profile.invoiceAddressLine2,
    [profile.invoiceCity, profile.invoiceProvince, profile.invoicePostalCode]
      .filter(Boolean)
      .join(", "),
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {logoUrl ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <Image
                src={logoUrl}
                alt={profile.name ?? "Organizer logo"}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-2xl font-bold text-muted">
              {(profile.name ?? profile.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{profile.name ?? "Organizer"}</h2>
            <p className="mt-1 text-sm text-muted">{profile.email}</p>
            {profile.bio && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
        <Button href="/organizer/profile/edit" size="md" className="organizer-accent-btn shrink-0">
          <Pencil className="h-4 w-4" />
          Edit profile
        </Button>
      </div>

      {publicUrl && (
        <DetailBlock title="Public Spotra page">
          <p className="font-mono text-sm text-foreground">{publicUrl}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <CopyLinkButton url={publicUrl} />
            <Link
              href={`/organizers/${profile.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-muted hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              View page
            </Link>
          </div>
        </DetailBlock>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailBlock title="Contact">
          <DetailRow label="Email" value={profile.email} />
          <DetailRow label="Phone" value={profile.phone} />
        </DetailBlock>

        <DetailBlock title="Links">
          {profile.websiteUrl && (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-foreground hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Website
            </a>
          )}
          {profile.instagramUrl && (
            <a
              href={profile.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-foreground hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Instagram
            </a>
          )}
          {!profile.websiteUrl && !profile.instagramUrl && (
            <p className="text-muted">No external links added yet.</p>
          )}
        </DetailBlock>

        <DetailBlock title="Invoice / billing">
          <DetailRow label="Company name" value={profile.invoiceCompanyName} />
          {addressLines.length > 0 && (
            <DetailRow
              label="Address"
              value={addressLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            />
          )}
          <DetailRow label="VAT number" value={profile.vatNumber} />
          {!profile.invoiceCompanyName && addressLines.length === 0 && (
            <p className="text-muted">Add billing details before your first paid event.</p>
          )}
        </DetailBlock>

        <DetailBlock title="Default refund policy">
          {profile.defaultRefundPolicy ? (
            <p className="whitespace-pre-wrap leading-relaxed text-foreground">
              {profile.defaultRefundPolicy}
            </p>
          ) : (
            <p className="text-muted">
              No default policy set. New events will start with a blank refund policy.
            </p>
          )}
        </DetailBlock>
      </div>
    </div>
  );
}
