import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AdminBackLinkProps = {
  href: string;
  label: string;
};

export function AdminBackLink({ href, label }: AdminBackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
