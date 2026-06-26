import Link from "next/link";
import type { FanUser } from "@/lib/auth/session";

const linkClass =
  "inline-flex rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm";

export function FanAuthLink({
  user,
  organizerSignedIn = false,
}: {
  user: FanUser | null;
  organizerSignedIn?: boolean;
}) {
  if (user) {
    return (
      <Link href="/account" className={linkClass}>
        Profile
      </Link>
    );
  }

  if (organizerSignedIn) {
    return null;
  }

  return (
    <Link href="/login" className={linkClass}>
      Sign in
    </Link>
  );
}
