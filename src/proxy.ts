import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

/**
 * Guards the admin console and every admin API route.
 * Unauthenticated page visits are sent to /admin-login; API calls get a 401.
 * The signed-in admin's email replaces any client-supplied x-admin-user header,
 * so audit logs can't be spoofed.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const email = await verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (!email) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Admin login required." }, { status: 401 });
    }
    const loginUrl = new URL("/admin-login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const headers = new Headers(request.headers);
  headers.set("x-admin-user", email);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin", "/api/admin/:path*"],
};
