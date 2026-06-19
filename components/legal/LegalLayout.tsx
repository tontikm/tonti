import Link from "next/link";
import { LEGAL_HUB_LINK, POLICY_LINKS } from "@/lib/site";
import { SocialLinks } from "@/components/layout/SocialLinks";

type LegalLayoutProps = {
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalLayout({
  title,
  description,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm text-muted">Last updated {lastUpdated}</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-4 text-muted">{description}</p>

      <div className="mt-8 border-b border-white/10 pb-8 text-sm">
        <Link
          href={LEGAL_HUB_LINK.href}
          className="font-medium text-foreground hover:underline"
        >
          View all policies →
        </Link>
        <p className="mt-3 text-muted">
          {POLICY_LINKS.map((link) => link.label).join(" · ")}
        </p>
      </div>

      <article className="prose-tonti mt-10 space-y-6 text-sm leading-relaxed text-muted [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:text-muted [&_strong]:text-foreground [&_ul]:space-y-2">
        {children}
      </article>

      <div className="mt-12 border-t border-white/10 pt-8">
        <p className="text-sm font-medium text-foreground">Follow Tonti</p>
        <SocialLinks className="mt-4" />
        <div className="mt-6">
          <Link
            href={LEGAL_HUB_LINK.href}
            className="text-xs text-muted hover:text-foreground"
          >
            {LEGAL_HUB_LINK.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
