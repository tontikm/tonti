"use client";

import { useEffect, useRef } from "react";

type SessionIdleWatcherProps = {
  idleMs: number;
  onExpire: () => void | Promise<void>;
};

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;
const RESET_THROTTLE_MS = 30_000;

export function SessionIdleWatcher({
  idleMs,
  onExpire,
}: SessionIdleWatcherProps) {
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastReset = 0;

    const scheduleExpiry = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void onExpireRef.current();
      }, idleMs);
    };

    const reset = () => {
      const now = Date.now();
      if (now - lastReset < RESET_THROTTLE_MS) return;
      lastReset = now;
      scheduleExpiry();
    };

    scheduleExpiry();
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, reset, { passive: true });
    }

    return () => {
      if (timer) clearTimeout(timer);
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, reset);
      }
    };
  }, [idleMs]);

  return null;
}
