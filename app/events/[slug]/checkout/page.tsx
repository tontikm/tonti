import { notFound, redirect } from "next/navigation";
import { CheckoutBasketGuard } from "@/components/basket/CheckoutBasketGuard";
import { CheckoutExperience } from "@/components/checkout/CheckoutExperience";
import { getFanUser } from "@/lib/auth/session";
import { getOrganizerSession } from "@/lib/organizer/session";
import { parseCartFromSearchParams } from "@/lib/checkout";
import { getPublicEventBySlug } from "@/lib/data/events";
import { isFanAuthConfigured } from "@/lib/supabase/server-auth";
import { isPayfastConfigured } from "@/lib/payments/config";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  return {
    title: event ? `Checkout · ${event.title}` : "Checkout",
  };
}

export default async function EventCheckoutPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  const cart = parseCartFromSearchParams(query, event.tiers);
  if (!cart) {
    redirect(`/events/${slug}`);
  }

  const user = await getFanUser();
  const organizerSession = await getOrganizerSession();
  const authConfigured = isFanAuthConfigured();
  const payfastEnabled = isPayfastConfigured() && !cart.isFree;
  const paymentCancelled = query.payment === "cancelled";
  const returnTo = `/events/${slug}/checkout?${new URLSearchParams(
    Object.entries(query).flatMap(([key, value]) =>
      typeof value === "string"
        ? [[key, value]]
        : Array.isArray(value)
          ? value.map((v) => [key, v])
          : [],
    ) as [string, string][],
  ).toString()}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <CheckoutBasketGuard eventSlug={slug}>
        <CheckoutExperience
          event={event}
          cart={cart}
          user={user}
          organizerEmail={
            organizerSession && !user ? organizerSession.email : null
          }
          authConfigured={authConfigured}
          payfastEnabled={payfastEnabled}
          paymentCancelled={paymentCancelled}
          returnTo={returnTo}
        />
      </CheckoutBasketGuard>
    </div>
  );
}
