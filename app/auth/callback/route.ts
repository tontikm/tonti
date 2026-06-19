import { NextResponse, type NextRequest } from "next/server";
import { sanitizeReturnTo } from "@/lib/auth/sanitize-return-to";
import {
  createRouteHandlerClient,
  isFanAuthConfigured,
} from "@/lib/supabase/server-auth";
import { getSiteOrigin } from "@/lib/site";

function resolveRedirectOrigin(request: NextRequest, fallbackOrigin: string): string {
  const { origin } = new URL(request.url);
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return origin;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${forwardedHost}`;
  }

  return getSiteOrigin() || fallbackOrigin;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const safeNext = sanitizeReturnTo(next);
  const siteOrigin = getSiteOrigin();

  if (!code) {
    return NextResponse.redirect(
      `${siteOrigin}/login?error=auth&next=${encodeURIComponent(safeNext)}`,
    );
  }

  if (!isFanAuthConfigured()) {
    return NextResponse.redirect(`${siteOrigin}/login?error=config`);
  }

  const redirectOrigin = resolveRedirectOrigin(request, siteOrigin);
  const redirectUrl = `${redirectOrigin}${safeNext}`;
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createRouteHandlerClient(request, response);
  if (!supabase) {
    return NextResponse.redirect(`${siteOrigin}/login?error=config`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${siteOrigin}/login?error=auth&next=${encodeURIComponent(safeNext)}`,
    );
  }

  return response;
}
