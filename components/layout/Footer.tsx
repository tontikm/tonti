import Link from "next/link";
import Image from "next/image";
import { EVENT_CATEGORIES } from "@/lib/data/categories";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_SRC, BRAND_LOGO_WIDTH, BRAND_NAME, LEGAL_HUB_LINK } from "@/lib/site";
import { SocialLinks } from "@/components/layout/SocialLinks";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Image
              src={BRAND_LOGO_SRC}
              alt={BRAND_NAME}
              width={BRAND_LOGO_WIDTH}
              height={BRAND_LOGO_HEIGHT}
              className="h-8 w-auto"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              South Africa&apos;s home for live music. Discover gigs, festivals,
              and club nights. Every moment matters.
            </p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Browse
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/events"
                  className="text-sm text-foreground/80 hover:text-foreground"
                >
                  All events
                </Link>
              </li>
              <li>
                <Link
                  href="/events?when=tonight"
                  className="text-sm text-foreground/80 hover:text-foreground"
                >
                  Tonight
                </Link>
              </li>
              <li>
                <Link
                  href="/events?when=weekend"
                  className="text-sm text-foreground/80 hover:text-foreground"
                >
                  This weekend
                </Link>
              </li>
              <li>
                <Link
                  href="/for-organizers"
                  className="text-sm text-foreground/80 hover:text-foreground"
                >
                  For organizers
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm text-foreground/80 hover:text-foreground"
                >
                  Help &amp; support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Categories
            </h3>
            <ul className="mt-4 space-y-2">
              {EVENT_CATEGORIES.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/events?category=${item.id}`}
                    className="text-sm text-foreground/80 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
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
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {BRAND_NAME}. Music events only.
          </p>
          <Link
            href={LEGAL_HUB_LINK.href}
            className="text-xs text-muted hover:text-foreground"
          >
            {LEGAL_HUB_LINK.label}
          </Link>
        </div>
      </div>
    </footer>
  );
}
