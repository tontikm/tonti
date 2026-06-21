import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { DoorScanner } from "@/components/organizer/DoorScanner";
import { getEventBySlug } from "@/lib/data/events";
import { requireOwnEvent } from "@/lib/organizer/require-auth";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? `Scan · ${event.title}` : "Door scanner",
  };
}

export default async function OrganizerEventScanPage({ params }: Props) {
  const { slug } = await params;
  const result = await requireOwnEvent(slug);
  if ("error" in result) {
    redirect("/organizer/events");
  }
  const { event } = result;

  return (
    <>
      <OrganizerPageHeader
        title="Door scanner"
        description={event.title}
      />

      <div className="max-w-lg">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-12 text-center text-sm text-muted">
              Loading scanner…
            </div>
          }
        >
          <DoorScanner eventSlug={slug} eventTitle={event.title} />
        </Suspense>
      </div>
    </>
  );
}
