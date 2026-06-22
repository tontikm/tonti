"use client";

import { useTransition } from "react";
import { updateOrganizerStatus } from "@/app/admin/actions";
import type { OrganizerStatus } from "@/lib/admin/data";
import { Button } from "@/components/ui/Button";

export function OrganizerStatusActions({
  organizerId,
  status,
}: {
  organizerId: string;
  status: OrganizerStatus;
}) {
  const [pending, startTransition] = useTransition();

  function run(next: OrganizerStatus) {
    startTransition(async () => {
      await updateOrganizerStatus(organizerId, next);
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
          Approve
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
      {status !== "suspended" && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            if (
              window.confirm(
                "Suspend this organizer? They will not be able to sign in.",
              )
            ) {
              run("suspended");
            }
          }}
        >
          Suspend
        </Button>
      )}
    </div>
  );
}
