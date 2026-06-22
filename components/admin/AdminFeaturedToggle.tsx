"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { toggleEventFeatured } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export function AdminFeaturedToggle({
  slug,
  featured,
}: {
  slug: string;
  featured: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onToggle() {
    startTransition(async () => {
      await toggleEventFeatured(slug, !featured);
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
        featured
          ? "border-amber-500/40 bg-amber-950/30 text-amber-200"
          : "border-white/15 text-muted hover:text-foreground",
        pending && "opacity-50",
      )}
      title={featured ? "Remove from homepage" : "Feature on homepage"}
    >
      <Star className={cn("h-3.5 w-3.5", featured && "fill-current")} />
      {featured ? "Featured" : "Feature"}
    </button>
  );
}
