"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEventBrand, type EventBrand } from "@/components/layout/EventBrandProvider";
import type { SearchItem } from "@/lib/search";
import { HeaderSearch } from "./HeaderSearch";
import { SiteNav } from "./SiteNav";

type HeaderClientProps = {
  organizerLink: React.ReactNode;
  fanLink: React.ReactNode;
  fanNavLink: { href: string; label: string } | null;
  fanSignedIn: boolean;
  searchItems: SearchItem[];
};

function TontiLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className="group flex items-center" aria-label="Tonti home">
      <Image
        src="/tonti-logo.png"
        alt="Tonti"
        width={598}
        height={215}
        priority
        className={className ?? "h-7 w-auto"}
      />
    </Link>
  );
}

function HeaderLogo({
  className,
  brand,
}: {
  className?: string;
  brand: EventBrand | null;
}) {
  if (brand) {
    return (
      <Link
        href={brand.href}
        className="group flex max-w-[160px] items-center sm:max-w-[200px]"
        aria-label={`${brand.name} — event home`}
      >
        <Image
          src={brand.logo}
          alt={brand.name}
          width={200}
          height={80}
          priority
          className={
            className ??
            "h-7 w-auto max-h-9 object-contain object-left sm:h-8"
          }
        />
      </Link>
    );
  }

  return <TontiLogo className={className} />;
}

export function HeaderClient({
  organizerLink,
  fanLink,
  fanNavLink,
  fanSignedIn,
  searchItems,
}: HeaderClientProps) {
  const pathname = usePathname();
  const { brand } = useEventBrand();
  const isHome = pathname === "/";
  const isEventPage = pathname.startsWith("/events/");

  if (isHome) {
    return (
      <header className="sticky top-0 z-50 bg-black">
        <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:grid-cols-[1fr_auto_1fr] sm:px-6 lg:px-8">
          <div className="flex items-center sm:justify-start">
            <HeaderSearch searchItems={searchItems} />
          </div>
          <div className="flex justify-center">
            <HeaderLogo className="h-8 w-auto sm:h-9" brand={brand} />
          </div>
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            {fanLink}
            {organizerLink}
            <SiteNav fanNavLink={fanNavLink} fanSignedIn={fanSignedIn} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-black">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <HeaderLogo brand={brand} />
        <div className="flex items-center gap-1 sm:gap-2">
          <HeaderSearch searchItems={searchItems} />
          {fanLink}
          {organizerLink}
          <SiteNav fanNavLink={fanNavLink} fanSignedIn={fanSignedIn} />
        </div>
      </div>
    </header>
  );
}
