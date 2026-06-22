import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface">
        <WifiOff className="h-7 w-7 text-muted" />
      </div>
      <h1 className="mt-6 text-2xl font-bold">You&apos;re offline</h1>
      <p className="mt-3 text-muted">
        Pages you&apos;ve already opened, including your tickets, still work
        without a connection. Reconnect to browse new events.
      </p>
      <Link
        href="/account"
        className="mt-8 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
      >
        My tickets
      </Link>
    </div>
  );
}
