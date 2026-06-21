import { notFound } from "next/navigation";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { PromoCodeManager } from "@/components/organizer/PromoCodeManager";
import { getEventBySlug } from "@/lib/data/events";
import { getEventPromoCodes } from "@/lib/promo/codes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatEventDate } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? `Promo codes · ${event.title}` : "Promo codes",
  };
}

export default async function OrganizerEventPromosPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const supabase = getSupabaseAdmin();
  const promos = supabase ? await getEventPromoCodes(supabase, slug) : [];

  return (
    <>
      <OrganizerPageHeader
        title={event.title}
        description={`${formatEventDate(event.date)} · Promo codes`}
      />

      {!supabase && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Promo codes require Supabase. Run migration{" "}
          <code className="text-foreground">0012_promo_codes.sql</code>.
        </div>
      )}

      <PromoCodeManager eventSlug={slug} promos={promos} />
    </>
  );
}
