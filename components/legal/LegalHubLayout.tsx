"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { POLICY_LINKS, BRAND_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type LegalHubLayoutProps = {
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalHubLayout({
  title,
  description,
  lastUpdated,
  children,
}: LegalHubLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Legal</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Policies and terms for using {BRAND_NAME} as a fan, ticket buyer, or organizer.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {POLICY_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "shrink-0 rounded-xl px-3 py-2.5 text-sm transition-colors lg:px-4",
                    active
                      ? "bg-white font-medium text-black"
                      : "text-muted hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <article className="min-w-0 flex-1">
          <p className="text-sm text-muted">Last updated {lastUpdated}</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-4 text-muted">{description}</p>

          <div className="prose-spotra mt-10 space-y-6 text-sm leading-relaxed text-muted [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:text-muted [&_strong]:text-foreground [&_ul]:space-y-2">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
