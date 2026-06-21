import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Ticket } from "lucide-react";
import { TicketEventHero } from "@/components/tickets/TicketEventHero";
import { TicketPassCard } from "@/components/tickets/TicketPassCard";
import { TicketWhatsAppActions } from "@/components/tickets/TicketWhatsAppActions";
import { SuccessConfetti } from "@/components/tickets/SuccessConfetti";
import { Button } from "@/components/ui/Button";
import { getFanUser } from "@/lib/auth/session";
import { canUserAccessOrder } from "@/lib/fan/orders";
import { getEventBySlug } from "@/lib/data/events";
import { isFanAuthConfigured } from "@/lib/supabase/server-auth";
import { getOrderById, getTicketsByOrderId } from "@/lib/tickets";
import {
  buildTicketWhatsAppMessage,
  getTicketOrderUrl,
} from "@/lib/tickets/whatsapp";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ orderId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  return {
    title: order ? "Your tickets" : "Tickets",
  };
}

export default async function TicketConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  if (isFanAuthConfigured()) {
    const user = await getFanUser();
    if (!user) {
      redirect(`/login?next=/tickets/${orderId}`);
    }
    if (!canUserAccessOrder(user, order)) {
      notFound();
    }
  }

  const [event, tickets] = await Promise.all([
    getEventBySlug(order.eventSlug),
    getTicketsByOrderId(orderId),
  ]);

  if (!event || tickets.length === 0) notFound();

  const orderUrl = getTicketOrderUrl(orderId);
  const whatsAppMessage = buildTicketWhatsAppMessage({
    event,
    order,
    tickets,
    orderUrl,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SuccessConfetti />
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 shadow-[0_0_40px_-12px_rgba(52,211,153,0.35)]">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              You&apos;re on the list
            </h1>
            <p className="mt-3 text-muted">
              Show your QR code at the door for{" "}
              <span className="font-medium text-foreground">{event.title}</span>
              .
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
