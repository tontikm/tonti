import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Ticket } from "lucide-react";
import { TicketEventHero } from "@/components/tickets/TicketEventHero";
import { TicketPassCard } from "@/components/tickets/TicketPassCard";
import { TicketWhatsAppActions } from "@/components/tickets/TicketWhatsAppActions";
import { SuccessConfetti } from "@/components/tickets/SuccessConfetti";
import { TicketIssuingPoller } from "@/components/tickets/TicketIssuingPoller";
import { ClearBasketOnOrder } from "@/components/basket/ClearBasketOnOrder";
import { Button } from "@/components/ui/Button";
import { getFanUser } from "@/lib/auth/session";
import { getEventBySlugFromDb } from "@/lib/data/events";
import { VENUES } from "@/lib/data/venues";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getOrderById,
  getTicketsByOrderIdForOwner,
} from "@/lib/tickets";
import { getOrderForTicketPage } from "@/lib/tickets/order-access";
import { issueTicketsIfMissing } from "@/lib/tickets/fulfill-order";
import {
  buildTicketWhatsAppMessage,
  getTicketOrderUrl,
} from "@/lib/tickets/whatsapp";
import type { Event } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ orderId: string }>;
};

function buildFallbackEvent(order: { eventSlug: string; createdAt: string }): Event {
  return {
    slug: order.eventSlug,
    title: order.eventSlug.replace(/-/g, " "),
    description: "",
    image: "",
    date: order.createdAt,
    doorsTime: order.createdAt,
    showTime: order.createdAt,
    category: "music",
    featured: false,
    publicationStatus: "approved",
    artists: [],
    venue: VENUES[0],
    tiers: [],
    tags: [],
    prohibitedItems: [],
  };
}

export async function generateMetadata({ params }: Props) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  return {
    title: order ? "Your tickets" : "Tickets",
  };
}

export default async function TicketConfirmationPage({ params }: Props) {
  const { orderId } = await params;

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const user = await getFanUser();
  if (!user) {
    redirect(`/login?next=/tickets/${orderId}`);
  }

  const order = await getOrderForTicketPage(orderId, user);
  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="mt-3 text-sm text-muted">
          We couldn&apos;t find this order on your account. Sign in with the
          email you used at checkout, or check{" "}
          <Link href="/account" className="text-foreground hover:underline">
            My tickets
          </Link>
          .
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/account">My tickets</Button>
          <Button href="/help" variant="secondary">
            Get help
          </Button>
        </div>
      </div>
    );
  }

  if (order.status === "pending_payment") {
    redirect(`/payments/payfast/complete?orderId=${orderId}`);
  }

  const supabase = getSupabaseAdmin();
  let issueError: string | null = null;
  if (supabase) {
    const issued = await issueTicketsIfMissing(supabase, orderId);
    if (!issued.ok) {
      issueError = issued.error;
    }
  }

  const [eventFromDb, tickets] = await Promise.all([
    getEventBySlugFromDb(order.eventSlug),
    getTicketsByOrderIdForOwner(orderId),
  ]);

  const event = eventFromDb ?? buildFallbackEvent(order);

  if (tickets.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <TicketIssuingPoller orderId={orderId} />
        <h1 className="text-2xl font-bold">Issuing your tickets</h1>
        <p className="mt-3 text-sm text-muted">
          Payment confirmed — your live entry QR tickets are being prepared.
          This usually takes a few seconds.
        </p>
        {issueError ? (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {issueError.includes("0029")
              ? "Ticket setup is incomplete on the server. The organizer needs to run database migration 0029_rotating_ticket_qr.sql in Supabase."
              : issueError}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={`/tickets/${orderId}`}>Refresh</Button>
          <Button href="/account" variant="secondary">
            My tickets
          </Button>
        </div>
      </div>
    );
  }

  const orderUrl = getTicketOrderUrl(orderId);
  const whatsAppMessage = buildTicketWhatsAppMessage({
    event,
    order,
    tickets,
    orderUrl,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <ClearBasketOnOrder />
      <SuccessConfetti />
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 shadow-[0_0_40px_-12px_rgba(52,211,153,0.35)]">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              You&apos;re on the list
            </h1>
            <p className="mt-3 text-muted">
              Show your live QR at the door for{" "}
              <span className="font-medium text-foreground">{event.title}</span>
              . It refreshes every 30 seconds.
            </p>
            <p className="mt-4 text-lg font-semibold text-emerald-100">
              {order.ticketCount} ticket{order.ticketCount !== 1 ? "s" : ""} ·{" "}
              {order.totalAmount === 0 ? "Free" : formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <TicketEventHero event={event} order={order} />
      </div>

      <div className="mt-6">
        <TicketWhatsAppActions
          buyerPhone={order.buyerPhone}
          message={whatsAppMessage}
        />
      </div>

      <div className="mt-10">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
          <Ticket className="h-5 w-5" />
          Your tickets
        </h2>

        <div className="space-y-4">
          {tickets.map((ticket, index) => (
            <TicketPassCard
              key={ticket.id}
              ticket={ticket}
              totpSecret={ticket.totpSecret}
              index={index}
              total={tickets.length}
              eventImage={event.image}
              eventTitle={event.title}
              category={event.category}
              showDivider={index < tickets.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/account" variant="secondary">
          My tickets
        </Button>
        <Button href={`/events/${event.slug}`} variant="secondary">
          Back to event
        </Button>
        <Button href="/events">Browse more shows</Button>
      </div>
    </div>
  );
}
