export type SocialPlatform = "instagram" | "whatsapp" | "tiktok" | "facebook";

export type SocialLink = {
  platform: SocialPlatform;
  href: string;
  label: string;
};

export const BRAND_NAME = "Spotra";

export const COMPANY_NAME = "Spotra (Pty) Ltd";

export const BRAND_LOGO_SRC = "/spotra-logo.png";
export const BRAND_ICON_SRC = "/spotra-icon.png";
/** Black ticket with white spot — favicon and light surfaces. */
export const BRAND_ICON_INVERTED_SRC = "/spotra-icon-inverted.png";
export const BRAND_ICON_SQUARE_SRC = "/spotra-icon-inverted-square.png";

export const BRAND_LOGO_WIDTH = 1150;
export const BRAND_LOGO_HEIGHT = 256;

export const BRAND_DOMAIN =
  process.env.NEXT_PUBLIC_BRAND_DOMAIN ?? "spotra.co.za";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@spotra.co.za";

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@spotra.co.za";

export const LEGAL_EMAIL =
  process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? "legal@spotra.co.za";

export const POPIA_EMAIL =
  process.env.NEXT_PUBLIC_POPIA_EMAIL ?? "privacy@spotra.co.za";

export function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/** Prefer the live request host (Vercel/custom domain) over env fallbacks. */
export async function getRequestOrigin(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${proto}://${host}`;
  }
  return getSiteOrigin();
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "instagram",
    href:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
      "https://www.instagram.com/spotra.co.za",
    label: "Instagram",
  },
  {
    platform: "whatsapp",
    href:
      process.env.NEXT_PUBLIC_WHATSAPP_URL ??
      "https://wa.me/27821234567",
    label: "WhatsApp",
  },
  {
    platform: "tiktok",
    href:
      process.env.NEXT_PUBLIC_TIKTOK_URL ??
      "https://www.tiktok.com/@spotra.co.za",
    label: "TikTok",
  },
  {
    platform: "facebook",
    href:
      process.env.NEXT_PUBLIC_FACEBOOK_URL ??
      "https://www.facebook.com/spotra.co.za",
    label: "Facebook",
  },
].filter((link): link is SocialLink => link.href.length > 0);

export const POLICY_LINKS = [
  { href: "/legal/terms", label: "Terms of service", slug: "terms" },
  { href: "/legal/privacy", label: "Privacy policy", slug: "privacy" },
  { href: "/legal/popia", label: "POPIA", slug: "popia" },
  { href: "/legal/cookies", label: "Cookie policy", slug: "cookies" },
  { href: "/legal/refunds", label: "Refund policy", slug: "refunds" },
] as const;

export const LEGAL_HUB_LINK = { href: "/legal", label: "Legal" } as const;

/** @deprecated Use POLICY_LINKS and LEGAL_HUB_LINK instead */
export const LEGAL_LINKS = [
  ...POLICY_LINKS,
  { href: "/help", label: "Help & support" },
] as const;
