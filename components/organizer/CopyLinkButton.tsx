"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

type CopyLinkButtonProps = {
  url: string;
  className?: string;
};

export function CopyLinkButton({ url, className = "" }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failures
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-foreground transition-colors hover:border-white/30 hover:bg-white/5 ${className}`}
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
  );
}
