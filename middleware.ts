import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin/constants";
import { shouldRedirectAdminFromPublicSite } from "@/lib/admin/public-route-guard";
import {
  clearFanActivityCookie,
  readFanActivityCookie,
  writeFanActivityCookie,
} from "@/lib/auth/fan-activity";
import {
  IDLE_TIMEOUTS_MS,
  isIdleExpired,
  shouldTouchActivity,
} from "@/lib/auth/idle-timeout";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAdminSession = Boolean(
    request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value,
  );

  if (shouldRedirectAdminFromPublicSite(pathname, hasAdminSession)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const activity = readFanActivityCookie(request);
    const lastActivity = activity ?? user.last_sign_in_at ?? new Date().toISOString();

    if (isIdleExpired(lastActivity, IDLE_TIMEOUTS_MS.fan)) {
      await supabase.auth.signOut();
      clearFanActivityCookie(response);
    } else if (!activity || shouldTouchActivity(lastActivity)) {
      writeFanActivityCookie(response);
    }
  } else if (readFanActivityCookie(request)) {
    clearFanActivityCookie(response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
