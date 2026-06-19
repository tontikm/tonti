"use client";

import { usePathname } from "next/navigation";

function isOrganizerRoute(pathname: string): boolean {
  return (
    pathname === "/for-organizers" || pathname.startsWith("/organizer")
  );
}

type ConditionalSiteChromeProps = {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export function ConditionalSiteChrome({
  header,
  footer,
  children,
}: ConditionalSiteChromeProps) {
  const pathname = usePathname();

  if (isOrganizerRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
