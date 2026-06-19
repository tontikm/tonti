import Link from "next/link";
import type { FanUser } from "@/lib/auth/session";

const linkClass =
  "hidden rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10 sm:inline-flex";

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

export function getFanNavLink(
  user: FanUser | null,
  organizerSignedIn = false,
): { href: string; label: string } | null {
  if (user) {
    return { href: "/account", label: "Profile" as const };
  }
  if (organizerSignedIn) {
    return null;
  }
  return { href: "/login", label: "Sign in" as const };
}
