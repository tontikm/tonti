import Link from "next/link";
import Image from "next/image";
import { EVENT_CATEGORIES } from "@/lib/data/categories";
import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_SRC,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
  LEGAL_HUB_LINK,
  POLICY_LINKS,
} from "@/lib/site";
import { SocialLinks } from "@/components/layout/SocialLinks";

const MOBILE_POLICY_LABEL: Record<
  (typeof POLICY_LINKS)[number]["slug"],
  string
> = {
  terms: "Terms",
  privacy: "Privacy",
  popia: "POPIA",
  cookies: "Cookies",
  refunds: "Refunds",
};

const BROWSE_LINKS = [
  { href: "/events", label: "All events" },
  { href: "/events?when=tonight", label: "Tonight" },
  { href: "/events?when=weekend", label: "This weekend" },
  { href: "/for-organizers", label: "For organizers" },
  { href: "/help", label: "Help & support" },
] as const;

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted sm:text-sm">
        {title}
      </h3>
      <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-foreground/80 hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Image
              src={BRAND_LOGO_SRC}
              alt={BRAND_NAME}
              width={BRAND_LOGO_WIDTH}
              height={BRAND_LOGO_HEIGHT}
              className="h-8 w-auto"
            />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted sm:mt-4">
              South Africa&apos;s home for live events. Discover nightlife,
              festivals, gigs, and lifestyle experiences.
            </p>
            <div className="mt-4 sm:mt-6">
              <SocialLinks />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:contents">
            <FooterLinkList title="Browse" links={BROWSE_LINKS} />
            <FooterLinkList
              title="Categories"
              links={EVENT_CATEGORIES.map((item) => ({
                href: `/events?category=${item.id}`,
                label: item.label,
              }))}
            />
          </div>

          <div className="hidden sm:block">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={LEGAL_HUB_LINK.href}
                  className="text-sm text-foreground/80 hover:text-foreground"
                >
                  {LEGAL_HUB_LINK.label}
                </Link>
              </li>
              {POLICY_LINKS.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <nav
          className="mt-8 flex flex-wrap gap-x-3 gap-y-2 border-t border-white/10 pt-6 sm:hidden"
          aria-label="Legal"
        >
          <Link
            href={LEGAL_HUB_LINK.href}
            className="text-xs font-medium text-foreground/90 hover:text-foreground"
          >
            {LEGAL_HUB_LINK.label}
          </Link>
          {POLICY_LINKS.map((link) => (
            <Link
              key={link.slug}
              href={link.href}
              className="text-xs text-muted hover:text-foreground"
            >
              {MOBILE_POLICY_LABEL[link.slug]}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:mt-10 sm:flex-row sm:gap-4 sm:pt-8">
          <p className="text-center text-xs text-muted sm:text-left">
            <span className="sm:hidden">
              © {new Date().getFullYear()} {BRAND_NAME}
            </span>
            <span className="hidden sm:inline">
              © {new Date().getFullYear()} {BRAND_NAME}. Nightlife, festivals,
              live music, and lifestyle across South Africa.
            </span>
          </p>
          <Link
            href={LEGAL_HUB_LINK.href}
            className="hidden text-xs text-muted hover:text-foreground sm:inline"
          >
            {LEGAL_HUB_LINK.label}
          </Link>
        </div>
      </div>
    </footer>
  );
}
