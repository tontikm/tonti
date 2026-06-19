import type { FanUser } from "@/lib/auth/session";
import { FanSignOutButton } from "@/components/auth/FanSignOutButton";

function formatMemberSince(isoDate: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    month: "long",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  }).format(new Date(isoDate));
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

type FanProfileHeaderProps = {
  user: FanUser;
};

export function FanProfileHeader({ user }: FanProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_0_40px_-16px_rgba(255,255,255,0.12)] sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.03] text-2xl font-bold text-foreground">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold sm:text-3xl">{user.name}</h1>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
            {user.createdAt ? (
              <p className="mt-2 text-xs text-muted/80">
                Member since {formatMemberSince(user.createdAt)}
              </p>
            ) : null}
          </div>
        </div>

        <FanSignOutButton className="shrink-0 self-start" />
      </div>
    </div>
  );
}
