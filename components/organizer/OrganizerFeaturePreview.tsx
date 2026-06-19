import { CalendarDays, QrCode, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

type PreviewVariant = "publish" | "sell" | "door";

const PREVIEWS: Record<
  PreviewVariant,
  {
    label: string;
    icon: typeof Ticket;
    headerBg: string;
    iconBg: string;
  }
> = {
  publish: {
    label: "Event builder",
    icon: CalendarDays,
    headerBg: "bg-violet-500/10 border-violet-500/20",
    iconBg: "bg-violet-500/20 text-violet-200",
  },
  sell: {
    label: "Ticket checkout",
    icon: Ticket,
    headerBg: "bg-orange-500/10 border-orange-500/20",
    iconBg: "bg-orange-500/20 text-orange-200",
  },
  door: {
    label: "Door scanner",
    icon: QrCode,
    headerBg: "bg-cyan-500/10 border-cyan-500/20",
    iconBg: "bg-cyan-500/20 text-cyan-200",
  },
};

export function OrganizerFeaturePreview({ variant }: { variant: PreviewVariant }) {
  const { label, icon: Icon, headerBg, iconBg } = PREVIEWS[variant];

  if (variant === "publish") {
    return (
      <PreviewFrame label={label} icon={Icon} headerBg={headerBg} iconBg={iconBg}>
        <div className="space-y-3">
          <div className="rounded-lg border border-white/10 bg-black/40 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
              Event title
            </p>
            <p className="mt-1 text-sm font-semibold">Summer Sessions</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/10 bg-black/40 p-3">
              <p className="text-[10px] text-muted">Date</p>
              <p className="mt-1 text-xs font-medium">Sat 21 Jun</p>
            </div>
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
              <p className="text-[10px] text-muted">Category</p>
              <p className="mt-1 text-xs font-medium text-violet-200">Nightlife</p>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/40 p-3">
            <p className="text-[10px] text-muted">Lineup</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["DJ Pulse", "Luna", "Kairo"].map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-100"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PreviewFrame>
    );
  }

  if (variant === "sell") {
    return (
      <PreviewFrame label={label} icon={Icon} headerBg={headerBg} iconBg={iconBg}>
        <div className="space-y-2">
          {[
            { name: "Early bird", price: "R150", left: "42 left" },
            { name: "General", price: "R220", left: "120 left" },
            { name: "VIP", price: "R450", left: "18 left" },
          ].map((tier) => (
            <div
              key={tier.name}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2.5"
            >
              <div>
                <p className="text-xs font-medium">{tier.name}</p>
                <p className="text-[10px] text-muted">{tier.left}</p>
              </div>
              <p className="text-xs font-semibold text-orange-200">{tier.price}</p>
            </div>
          ))}
          <div className="mt-3 rounded-lg bg-orange-500 px-3 py-2 text-center text-xs font-semibold text-white">
            Complete checkout
          </div>
        </div>
      </PreviewFrame>
    );
  }

  return (
    <PreviewFrame label={label} icon={Icon} headerBg={headerBg} iconBg={iconBg}>
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl border border-cyan-500/30 bg-white p-3">
          <div className="grid h-24 w-24 grid-cols-5 grid-rows-5 gap-0.5">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-sm ${i % 3 === 0 ? "bg-black" : "bg-black/20"}`}
              />
            ))}
          </div>
        </div>
        <div className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center">
          <p className="text-xs font-medium text-emerald-200">Checked in</p>
          <p className="mt-0.5 font-mono text-[10px] text-muted">TNTI-A1B2-C3D4</p>
        </div>
      </div>
    </PreviewFrame>
  );
}

function PreviewFrame({
  label,
  icon: Icon,
  headerBg,
  iconBg,
  children,
}: {
  label: string;
  icon: typeof Ticket;
  headerBg: string;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-1 shadow-xl shadow-violet-900/20">
      <div className={cn("flex items-center gap-2 border-b px-4 py-3", headerBg)}>
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            iconBg,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-xs font-medium text-foreground/80">{label}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
