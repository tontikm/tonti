import Link from "next/link";
import { logoutOrganizer } from "@/app/organizer/actions";

type OrganizerFanAuthNoticeProps = {
  organizerEmail: string;
  fanLoginHref?: string;
  returnTo?: string;
  purpose?: "checkout" | "follow";
  className?: string;
};

export function OrganizerFanAuthNotice({
  organizerEmail,
  fanLoginHref = "/login",
  returnTo,
  purpose = "checkout",
  className = "",
}: OrganizerFanAuthNoticeProps) {
  const fanAction =
    purpose === "follow" ? "follow events" : "buy tickets";

  return (
    <div
      className={`rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm ${className}`}
    >
      <p className="font-medium text-foreground">
        Signed in as organizer ({organizerEmail})
      </p>
      <p className="mt-1 text-muted">
        Organizer login is for your dashboard only. To {fanAction}, sign out
        as organizer and sign in with a separate{" "}
        <span className="text-foreground">fan account</span>. You can use the
        same email if you registered both ways.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <form action={logoutOrganizer}>
          {returnTo ? (
            <input type="hidden" name="returnTo" value={returnTo} />
          ) : null}
          <button
            type="submit"
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-white/40"
          >
            Sign out as organizer
          </button>
        </form>
        {fanLoginHref !== "#" && (
          <Link
            href={fanLoginHref}
            className="text-sm text-foreground underline-offset-4 hover:underline"
          >
            Go to fan sign-in
          </Link>
        )}
      </div>
    </div>
  );
}
