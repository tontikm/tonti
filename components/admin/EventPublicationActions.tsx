"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEventPublicationStatus } from "@/app/admin/actions";
import type { EventPublicationStatus } from "@/lib/admin/data";
import { Button } from "@/components/ui/Button";

export function EventPublicationActions({
  slug,
  status,
}: {
  slug: string;
  status: EventPublicationStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(next: EventPublicationStatus) {
    startTransition(async () => {
      await updateEventPublicationStatus(slug, next);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "approved" && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => run("approved")}
        >
          Approve & publish
        </Button>
      )}
      {status !== "pending" && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => run("pending")}
        >
          Set pending
        </Button>
      )}
      {status !== "rejected" && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            if (
              window.confirm(
                "Reject this event? It will stay hidden from the public site.",
              )
            ) {
              run("rejected");
            }
          }}
        >
          Reject
        </Button>
      )}
    </div>
  );
}
