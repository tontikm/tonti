"use client";

import { useState } from "react";
import { MessageCircle, Link2, Check } from "lucide-react";
import { getWhatsAppSendUrl } from "@/lib/tickets/whatsapp";

type ShareButtonsProps = {
  shareMessage: string;
};

export function ShareButtons({ shareMessage }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  function shareWhatsApp() {
    window.open(getWhatsAppSendUrl(null, shareMessage), "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failures
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={shareWhatsApp}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground/40 hover:bg-surface-hover"
      >
        <MessageCircle className="h-4 w-4" />
        Share on WhatsApp
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground/40 hover:bg-surface-hover"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
