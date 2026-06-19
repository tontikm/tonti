import Link from "next/link";

type OrganizerFanAuthNoticeProps = {
  organizerEmail: string;
  fanLoginHref?: string;
  className?: string;
};

export function OrganizerFanAuthNotice({
  organizerEmail,
  fanLoginHref = "/login",
  className = "",
}: OrganizerFanAuthNoticeProps) {
  return (
    <div
      className={`rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm ${className}`}
    >
      <p className="font-medium text-foreground">
        Signed in as organizer ({organizerEmail})
      </p>
      <p className="mt-1 text-muted">
        Organizer login is for your dashboard only. To buy tickets, sign in with a
        separate{" "}
        <span className="text-foreground">fan account</span> below — you can use
        the same email if you registered both ways.
      </p>
      {fanLoginHref !== "#" && (
        <Link
          href={fanLoginHref}
          className="mt-2 inline-block text-sm text-foreground underline-offset-4 hover:underline"
        >
          Go to fan sign-in
        </Link>
      )}
    </div>
  );
}
