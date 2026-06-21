"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleEventFollow } from "@/app/events/actions";
import { OrganizerFanAuthNotice } from "@/components/auth/OrganizerFanAuthNotice";

type EventFollowButtonProps = {
  eventSlug: string;
  initialFollowing: boolean;
  isSignedIn: boolean;
  organizerEmail?: string | null;
};

export function EventFollowButton({
  eventSlug,
  initialFollowing,
  isSignedIn,
  organizerEmail,
}: EventFollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [showOrganizerPrompt, setShowOrganizerPrompt] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (organizerEmail && !isSignedIn) {
      setShowOrganizerPrompt(true);
      return;
    }

    if (!isSignedIn) {
      const returnPath = `/events/${eventSlug}?follow=1`;
      router.push(
        `/login?next=${encodeURIComponent(returnPath)}`,
      );
      return;
    }

    const nextFollowing = !following;
    setFollowing(nextFollowing);

    startTransition(async () => {
      const result = await toggleEventFollow(eventSlug);
      if (result.error) {
        setFollowing(!nextFollowing);
        return;
      }
      if (typeof result.following === "boolean") {
        setFollowing(result.following);
      }
      router.refresh();
    });
  }

  const returnPath = `/events/${eventSlug}?follow=1`;

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-3 sm:w-auto">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={following}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-60 ${
          following
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-border bg-surface text-foreground hover:border-foreground/40 hover:bg-surface-hover"
        }`}
      >
        <Heart
          className={`h-4 w-4 ${following ? "fill-current" : ""}`}
          aria-hidden
        />
        {pending ? "Saving…" : following ? "Following" : "Follow"}
      </button>

      {showOrganizerPrompt && organizerEmail ? (
        <OrganizerFanAuthNotice
          organizerEmail={organizerEmail}
          purpose="follow"
          returnTo={returnPath}
          fanLoginHref={`/login?next=${encodeURIComponent(returnPath)}`}
          className="w-full max-w-md"
        />
      ) : null}
    </div>
  );
}
