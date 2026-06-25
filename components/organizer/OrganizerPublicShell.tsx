import Link from "next/link";
import Image from "next/image";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_SRC, BRAND_LOGO_WIDTH, BRAND_NAME } from "@/lib/site";

type OrganizerPublicShellProps = {
  children: React.ReactNode;
  logoHref?: string;
};

export function OrganizerPublicShell({
  children,
  logoHref = "/",
}: OrganizerPublicShellProps) {
  return (
    <div className="organizer-theme relative min-h-screen bg-black">
      <div className="pointer-events-none absolute inset-0 organizer-glow" />
      <header className="relative z-10 border-b border-violet-500/10 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center px-4 sm:px-6 lg:px-8">
          <Link href={logoHref} className="inline-flex shrink-0 items-center">
            <Image
              src={BRAND_LOGO_SRC}
              alt={BRAND_NAME}
              width={BRAND_LOGO_WIDTH}
              height={BRAND_LOGO_HEIGHT}
              className="h-7 w-auto"
              priority
            />
          </Link>
        </div>
      </header>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
