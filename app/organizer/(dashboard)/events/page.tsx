import Link from "next/link";
import { Pencil, Plus, Users } from "lucide-react";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { OrganizerEventActions } from "@/components/organizer/OrganizerEventActions";
import { Button } from "@/components/ui/Button";
import { getEventsForOrganizer } from "@/lib/data/events";
import { getOrganizerByEmail } from "@/lib/organizer/profile";
import { getOrganizerSession } from "@/lib/organizer/session";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { formatEventDate, formatPrice, getLowestPrice } from "@/lib/utils";

export const metadata = {
  title: "Your events",
};

type Props = {
  searchParams: Promise<{ deleted?: string }>;
};

export default async function OrganizerEventsPage({ searchParams }: Props) {
  const { deleted } = await searchParams;
  const session = await getOrganizerSession();
  const profile = session ? await getOrganizerByEmail(session.email) : null;
  const events = await getEventsForOrganizer(
    profile?.id ?? session?.id,
    profile?.name ?? session?.name,
  );
  const supabaseReady = isSupabaseAdminConfigured();

  return (
    <>
      <OrganizerPageHeader
        title="Events"
        description={`${events.length} event${events.length !== 1 ? "s" : ""} on Tonti`}
        action={
          <Button href="/organizer/events/new" size="md" className="organizer-accent-btn">
            <Plus className="h-4 w-4" />
            New event
          </Button>
        }
      />

      {deleted === "1" && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-foreground">
          Event deleted.
        </div>
      )}

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Supabase is not configured — new events cannot be saved yet. Add{" "}
          <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
          <code className="text-foreground">.env.local</code> and run the
          migration + seed script.
        </div>
      )}

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="text-muted">You haven&apos;t listed any events yet.</p>
          <Button href="/organizer/events/new" className="mt-4" size="md">
            <Plus className="h-4 w-4" />
            Create your first event
          </Button>
        </div>
      ) : (
      <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
        {events.map((event) => {
          const price = getLowestPrice(event.tiers);
          return (
            <li key={event.slug} className="px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/events/${event.slug}`}
                      className="font-medium hover:underline"
                    >
                      {event.title}
                    </Link>
                    {event.featured && (
                      <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                        Homepage
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {formatEventDate(event.date)} · {event.venue.city}
                  </p>
                  <p className="mt-1 text-sm font-mono text-muted">
                    {price !== null ? `From ${formatPrice(price)}` : "—"}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Link
                    href={`/organizer/events/${event.slug}/tickets`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Tickets
                  </Link>
                  <OrganizerEventActions
                    slug={event.slug}
                    featured={event.featured}
                    supabaseReady={supabaseReady}
                  />
                  <Link
                    href={`/organizer/events/${event.slug}/edit`}
                    className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      )}
    </>
  );
}
