import Link from "next/link";
import { getOrganizerSession } from "@/lib/organizer/session";

export async function HeaderOrganizerLink() {
  const session = await getOrganizerSession();

  if (session) {
    return (
      <Link
        href="/organizer"
        className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 sm:px-5 sm:py-2 sm:text-sm"
      >
        Dashboard
      </Link>
    );
  }

  return null;
}
