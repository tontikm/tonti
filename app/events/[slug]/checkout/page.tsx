import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CheckoutAuthGate } from "@/components/auth/CheckoutAuthGate";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { getFanUser } from "@/lib/auth/session";
import { getOrganizerSession } from "@/lib/organizer/session";
import { parseCartFromSearchParams } from "@/lib/checkout";
import { getEventBySlug } from "@/lib/data/events";
import { isFanAuthConfigured } from "@/lib/supabase/server-auth";
import { isPayfastConfigured } from "@/lib/payments/config";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return {
    title: event ? `Checkout · ${event.title}` : "Checkout",
  };
}

export default async function EventCheckoutPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const cart = parseCartFromSearchParams(query, event.tiers);
  if (!cart) {
    redirect(`/events/${slug}`);
  }

  const user = await getFanUser();
  const organizerSession = await getOrganizerSession();
  const authConfigured = isFanAuthConfigured();
  const payfastEnabled = isPayfastConfigured() && !cart.isFree;
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/events/${slug}`}
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to event
      </Link>

      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        {user
          ? payfastEnabled
            ? "Review your order, then continue to Payfast for secure payment."
            : "Review your order and confirm your tickets."
          : organizerSession
            ? "You're signed in as an organizer — use a fan account below to complete this order."
            : "Sign in or create an account to complete your order."}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        {user ? (
          <CheckoutForm
            eventSlug={slug}
            cart={cart}
            user={user}
            payfastEnabled={payfastEnabled}
          />
        ) : (
          <CheckoutAuthGate
            returnTo={returnTo}
            authConfigured={authConfigured}
            organizerEmail={
              organizerSession && !user ? organizerSession.email : null
            }
          />
        )}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutSummary event={event} cart={cart} />
        </div>
      </div>
    </div>
  );
}
