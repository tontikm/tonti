import Link from "next/link";
import { getOrganizerSession } from "@/lib/organizer/session";

export async function HeaderOrganizerLink() {
  const session = await getOrganizerSession();

  if (session) {
    return (
      <Link
        href={session.role === "scanner" ? "/organizer/scan" : "/organizer"}
        className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 sm:px-5 sm:py-2 sm:text-sm"
      >
        {session.role === "scanner" ? "Scanner" : "Dashboard"}
      </Link>
    );
  }

  return null;
}
