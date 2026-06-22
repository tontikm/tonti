import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { getOrganizerSession } from "@/lib/organizer/session";
import type { OrganizerStatus } from "@/lib/types";

export async function OrganizerPendingBanner() {
  const session = await getOrganizerSession();
  if (!session) return null;

  const profile = await getOrganizerByEmail(session.email);
  const status = profile?.status as OrganizerStatus | undefined;

  if (status !== "pending") return null;

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 px-5 py-4 text-sm">
      <p className="font-medium text-amber-100">Account under review</p>
      <p className="mt-1 text-muted">
        You can set up events and tickets now, but they won&apos;t appear on
        Tonti until your organizer account is approved.
      </p>
    </div>
  );
}
