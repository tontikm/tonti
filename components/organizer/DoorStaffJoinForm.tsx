"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  acceptDoorStaffInviteAction,
  type AcceptDoorStaffInviteState,
} from "@/app/organizer/actions";
import { OrganizerAuthCard } from "@/components/organizer/OrganizerAuthCard";
import { OrganizerPublicShell } from "@/components/organizer/OrganizerPublicShell";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-white/40 focus:outline-none";

type DoorStaffJoinFormProps = {
  token: string;
  eventTitle: string;
  email: string;
  defaultName: string | null;
  expired: boolean;
};

export function DoorStaffJoinForm({
  token,
  eventTitle,
  email,
  defaultName,
  expired,
}: DoorStaffJoinFormProps) {
  const [state, formAction, pending] = useActionState<
    AcceptDoorStaffInviteState,
    FormData
  >(acceptDoorStaffInviteAction, {});

  if (expired) {
    return (
      <OrganizerPublicShell logoHref="/organizer/login">
        <OrganizerAuthCard
          title="Invite expired"
          description={`The door staff invite for ${eventTitle} has expired. Ask the organizer to send a new link.`}
          footer={
            <Link
              href="/organizer/login"
              className="text-sm text-muted hover:text-foreground"
            >
              Back to login
            </Link>
          }
        >
          <></>
        </OrganizerAuthCard>
      </OrganizerPublicShell>
    );
  }

  return (
    <OrganizerPublicShell logoHref="/organizer/login">
      <OrganizerAuthCard
        title="Join as door staff"
        description={`Set a password to scan tickets for ${eventTitle}.`}
        footer={
          <Link
            href="/organizer/login"
            className="text-sm text-muted hover:text-foreground"
          >
            Already have an account? Sign in
          </Link>
        }
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              value={email}
              readOnly
              className={`${inputClass} text-muted`}
            />
          </div>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Your name
            </label>
            <input
              id="name"
              name="name"
              defaultValue={defaultName ?? ""}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          {state.error ? (
            <p className="text-sm text-amber-400">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creating account…" : "Activate scanner access"}
          </Button>
        </form>
      </OrganizerAuthCard>
    </OrganizerPublicShell>
  );
}
