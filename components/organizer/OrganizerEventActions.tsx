"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEvent } from "@/app/organizer/actions";

type OrganizerEventActionsProps = {
  slug: string;
  supabaseReady: boolean;
};

export function OrganizerEventActions({
  slug,
  supabaseReady,
}: OrganizerEventActionsProps) {
  const [pending, startTransition] = useTransition();

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
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}
