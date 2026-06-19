import Link from "next/link";
import { getOrganizerSession } from "@/lib/organizer/session";

export async function HeaderOrganizerLink() {
  const session = await getOrganizerSession();

  if (session) {
    return (
      <Link
        href="/organizer"
        className="hidden rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 sm:inline-flex"
      >
        Dashboard
      </Link>
    );
  }

  return null;
}
