import { Ticket } from "lucide-react";

const TRUST_CHIPS = ["QR tickets", "Order history", "Secure checkout"] as const;

type FanAuthCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  notice?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function FanAuthCard({
  eyebrow = "Account required",
  title,
  description,
  notice,
  children,
  footer,
}: FanAuthCardProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-8 top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-4 top-1/3 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative rounded-[28px] border border-emerald-500/20 bg-white/[0.03] p-6 shadow-2xl shadow-emerald-900/20 backdrop-blur-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Ticket className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/90">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-2xl font-bold sm:text-[1.65rem]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {TRUST_CHIPS.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted"
            >
              {chip}
            </span>
          ))}
        </div>

        {notice ? <div className="mt-6">{notice}</div> : null}

        <div className={notice ? "mt-6" : "mt-8"}>{children}</div>

        {footer ? (
          <div className="mt-6 border-t border-white/10 pt-6">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
