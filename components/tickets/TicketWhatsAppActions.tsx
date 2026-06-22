"use client";

import { MessageCircle } from "lucide-react";
import { getWhatsAppSendUrl } from "@/lib/tickets/whatsapp";

type TicketWhatsAppActionsProps = {
  buyerPhone?: string;
  message: string;
};

export function TicketWhatsAppActions({
  buyerPhone,
  message,
}: TicketWhatsAppActionsProps) {
  const sendToMeUrl = buyerPhone
    ? getWhatsAppSendUrl(buyerPhone, message)
    : null;
  const shareUrl = getWhatsAppSendUrl(null, message);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="text-lg font-semibold">Get tickets on WhatsApp</h2>
      {buyerPhone ? (
        <p className="mt-2 text-sm text-muted">
          We saved your number. Tap below to send your tickets.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Share your QR codes with friends or save them to your phone.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {sendToMeUrl ? (
          <a
            href={sendToMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Send to my WhatsApp
          </a>
        ) : null}
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-2.5 text-sm font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/20"
        >
          <MessageCircle className="h-4 w-4" />
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
