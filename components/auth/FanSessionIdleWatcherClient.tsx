"use client";

import { signOut } from "@/app/auth/actions";
import { SessionIdleWatcher } from "@/components/auth/SessionIdleWatcher";
import { IDLE_TIMEOUTS_MS } from "@/lib/auth/idle-timeout";

export function FanSessionIdleWatcherClient() {
  return (
    <SessionIdleWatcher
      idleMs={IDLE_TIMEOUTS_MS.fan}
      onExpire={() => {
        void signOut("/login?reason=idle");
      }}
    />
  );
}
