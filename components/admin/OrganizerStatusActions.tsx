"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(next: OrganizerStatus) {
    startTransition(async () => {
      await updateOrganizerStatus(organizerId, next);
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
