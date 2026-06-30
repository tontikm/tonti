import { Button } from "@/components/ui/Button";
import { ORGANIZER_FEE_RATE, BOOKING_FEE_PER_TICKET } from "@/lib/payments/service-fee";
import { CONTACT_EMAIL, BRAND_NAME } from "@/lib/site";

type TierCardProps = {
  label: string;
  labelAccent?: string;
  subtitle: string;
  rate: string;
  attendeeRange: string;
  features: string[];
  highlighted?: boolean;
  muted?: boolean;
  badge?: string;
  footer?: React.ReactNode;
};

function TierCard({
  label,
  labelAccent,
  subtitle,
  rate,
  attendeeRange,
  features,
  highlighted = false,
  muted = false,
  badge,
  footer,
}: TierCardProps) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white/[0.03] p-6 ${
        highlighted
          ? "border-violet-500/50 shadow-lg shadow-violet-900/20"
          : "border-white/10"
      } ${muted ? "opacity-75" : ""}`}
    >
      {badge && (
        <div className="absolute right-4 top-4 rounded-full border border-violet-400/40 bg-violet-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-200">
          {badge}
        </div>
      )}

      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
        {labelAccent ? (
          <span className="text-violet-300"> · {labelAccent}</span>
        ) : null}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{subtitle}</p>
      <p className="mt-4 text-5xl font-bold tracking-tight">{rate}</p>
      <p className="mt-2 text-sm text-muted">{attendeeRange}</p>

      <div className="my-6 h-px bg-white/10" />

      <ul className="flex-1 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="border-b border-white/5 pb-3 text-sm leading-relaxed text-muted last:border-0 last:pb-0"
          >
            {feature}
          </li>
        ))}
      </ul>

      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
}

export function OrganizerFeeTiers() {
  const feePercent = (ORGANIZER_FEE_RATE * 100).toFixed(1).replace(/\.0$/, "");

  return (
    <section className="relative border-b border-white/10 bg-zinc-950">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Proposed fee tiers
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <TierCard
            label="Essential"
            subtitle="Self-service"
            rate={`${feePercent}%`}
            attendeeRange="0 – 2,000 attendees"
            features={[
              `${feePercent}% platform fee on paid tickets`,
              `R${BOOKING_FEE_PER_TICKET} buyer booking fee per ticket`,
              "Fans pay ticket price plus booking fee",
              "Free RSVPs excluded from fees",
              "Payfast checkout when enabled",
              "QR door scan and guest list",
              "Listed on Spotra discovery",
            ]}
          />

          <div className="relative">
            <div className="pointer-events-none">
              <TierCard
                label="Pro"
                labelAccent="recommended"
                subtitle="Managed"
                rate="4.25%"
                attendeeRange="1,000 – 10,000 attendees"
                highlighted
                muted
                features={[
                  "Cashless NFC included",
                  "Settlement: T+1 day",
                  "Advanced analytics dashboard",
                  "Dedicated onboarding support",
                  "Comp tickets: R1.00 each",
                  "SMS / email campaign tools",
                  "Seating plans available",
                  "Vendor management included",
                ]}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[1px]">
              <span className="rounded-full border border-white/20 bg-black/80 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                Coming soon
              </span>
            </div>
          </div>

          <TierCard
            label="Enterprise"
            subtitle="Custom"
            rate="3–4%"
            attendeeRange="10,000+ / govt / diplomatic"
            features={[
              "Negotiated per contract",
              "White-label option",
              "Real-time settlement",
              "Full RFID deployment",
              "B-BBEE Level 1 SLA",
              "Govt / diplomatic pricing",
              "Multi-currency support",
              "Dedicated account team",
            ]}
            footer={
              <Button
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${BRAND_NAME} Enterprise pricing`)}`}
                variant="secondary"
                className="w-full justify-center"
              >
                Contact us
              </Button>
            }
          />
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          All fees excl. VAT. VAT charged on {BRAND_NAME}&apos;s commission, not on
          ticket face value.
        </p>
      </div>
    </section>
  );
}
