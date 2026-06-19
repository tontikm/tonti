"use client";

import { useState } from "react";
import { MessageCircle, Link2, Check } from "lucide-react";

type ShareButtonsProps = {
  title: string;
};

export function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  function shareWhatsApp() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `${title} — book on Tonti`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
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
