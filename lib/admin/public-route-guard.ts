const ADMIN_PREFIX = "/admin";

const STATIC_ASSET_PATTERN =
  /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|css|js|map)$/i;

/** Paths that stay reachable while an admin session cookie is present. */
export function isAdminAllowedPath(pathname: string): boolean {
  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
    return true;
  }
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/manifest.webmanifest" || pathname === "/sw.js") {
    return true;
  }
  if (STATIC_ASSET_PATTERN.test(pathname)) return true;
  return false;
}

export function shouldRedirectAdminFromPublicSite(
  pathname: string,
  hasAdminSession: boolean,
): boolean {
  if (!hasAdminSession) return false;
  return !isAdminAllowedPath(pathname);
}
