"use client";

import { useActionState, useState } from "react";
import { Copy, ScanLine, UserMinus, UserPlus } from "lucide-react";
import {
  inviteDoorStaff,
  revokeDoorStaff,
  type InviteDoorStaffState,
} from "@/app/organizer/actions";
import type { EventDoorStaffMember } from "@/lib/organizer/door-staff";
import { Button } from "@/components/ui/Button";
import { formatEventTime } from "@/lib/utils";

type DoorStaffManagerProps = {
  eventSlug: string;
  members: EventDoorStaffMember[];
};

const initialInviteState: InviteDoorStaffState = {};

export function DoorStaffManager({
  eventSlug,
  members,
}: DoorStaffManagerProps) {
  const [inviteState, inviteAction, invitePending] = useActionState(
    inviteDoorStaff,
    initialInviteState,
  );
  const [copied, setCopied] = useState(false);

  async function handleCopyInviteUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable.
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-2">
        <ScanLine className="h-5 w-5 text-violet-400" />
        <h2 className="text-lg font-semibold">Door staff</h2>
      </div>
      <p className="mt-2 text-sm text-muted">
        Invite scan-only staff for this event. They can check in tickets but
        cannot view sales, guest lists, or edit the event.
      </p>

      <form action={inviteAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="eventSlug" value={eventSlug} />
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="staff@example.com"
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Name (optional)</span>
          <input
            name="name"
            placeholder="Door 1"
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:border-foreground/40 focus:outline-none"
          />
        </label>
        <div className="flex items-end">
          <Button type="submit" disabled={invitePending} className="w-full">
            <UserPlus className="h-4 w-4" />
            {invitePending ? "Creating invite…" : "Invite staff"}
          </Button>
        </div>
      </form>

      {inviteState.error && (
        <p className="mt-4 text-sm text-amber-400">{inviteState.error}</p>
      )}
      {inviteState.success && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <p className="text-emerald-200">{inviteState.success}</p>
          {inviteState.inviteUrl ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={inviteState.inviteUrl}
                className="min-w-0 flex-1 rounded-xl border border-border bg-black/40 px-3 py-2 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => void handleCopyInviteUrl(inviteState.inviteUrl!)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted">
          Assigned staff
        </h3>
        {members.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No door staff invited yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-border">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {member.name || member.email}
                  </p>
                  <p className="mt-1 text-sm text-muted">{member.email}</p>
                  <p className="mt-1 text-xs text-muted">
                    {member.assignmentStatus === "invited"
                      ? member.inviteExpiresAt
                        ? `Invite pending · expires ${formatEventTime(member.inviteExpiresAt)}`
                        : "Invite pending"
                      : member.assignmentStatus === "active"
                        ? "Active scanner"
                        : "Revoked"}
                  </p>
                </div>
                {member.assignmentStatus !== "revoked" ? (
                  <form action={revokeDoorStaff}>
                    <input type="hidden" name="eventSlug" value={eventSlug} />
                    <input type="hidden" name="assignmentId" value={member.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                      Revoke
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
