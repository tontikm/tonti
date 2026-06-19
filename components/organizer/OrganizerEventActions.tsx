"use client";

import { useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { deleteEvent, toggleEventFeatured } from "@/app/organizer/actions";

type OrganizerEventActionsProps = {
  slug: string;
  featured: boolean;
  supabaseReady: boolean;
};

export function OrganizerEventActions({
  slug,
  featured,
  supabaseReady,
}: OrganizerEventActionsProps) {
  const [pending, startTransition] = useTransition();

  function onToggleFeatured() {
    if (!supabaseReady) return;
    startTransition(async () => {
      await toggleEventFeatured(slug, !featured);
    });
  }

  function onDelete() {
    if (!supabaseReady) return;
    const confirmed = window.confirm(
      `Delete "${slug}"? This cannot be undone and removes all ticket tiers.`,
    );
    if (!confirmed) return;
    startTransition(async () => {
      await deleteEvent(slug);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={!supabaseReady || pending}
        onClick={onToggleFeatured}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
          featured
            ? "border-foreground bg-foreground text-background"
            : "border-border text-muted hover:border-foreground/40 hover:text-foreground"
        }`}
      >
        <Star className={`h-3.5 w-3.5 ${featured ? "fill-current" : ""}`} />
        {featured ? "Featured" : "Feature"}
      </button>
      <button
        type="button"
        disabled={!supabaseReady || pending}
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}
