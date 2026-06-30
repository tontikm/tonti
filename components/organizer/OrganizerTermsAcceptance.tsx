"use client";

import Link from "next/link";

type OrganizerTermsAcceptanceProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
};

export function OrganizerTermsAcceptance({
  checked,
  onChange,
  id = "acceptOrganizerTerms",
}: OrganizerTermsAcceptanceProps) {
  return (
    <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-violet-200/80">
        Before you publish
      </p>
      <label
        htmlFor={id}
        className="mt-4 flex cursor-pointer items-start gap-3 text-sm"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-violet-500/40 accent-violet-500"
        />
        <span className="text-muted">
          I agree to Spotra&apos;s{" "}
          <Link
            href="/legal/terms"
            target="_blank"
            className="text-foreground underline-offset-4 hover:underline"
          >
            terms
          </Link>
          ,{" "}
          <Link
            href="/legal/privacy"
            target="_blank"
            className="text-foreground underline-offset-4 hover:underline"
          >
            privacy policy
          </Link>
          , and{" "}
          <Link
            href="/legal/refunds"
            target="_blank"
            className="text-foreground underline-offset-4 hover:underline"
          >
            refund policy
          </Link>
          . I confirm I have authority to list this event and that the
          information is accurate. I understand Spotra charges a 3.5% platform fee
          per paid ticket (free RSVPs excluded), deducted from my side, not
          added to the fan&apos;s ticket price. Fans pay a separate R6 booking
          fee per ticket at checkout.
        </span>
      </label>
    </div>
  );
}
