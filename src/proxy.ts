import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // We can't use Prisma here (Edge Runtime), so we check for the session cookie.
  // Full role verification happens in the Layouts/Pages.
  const sessionToken = request.cookies.get("session_token")?.value;

  const path = request.nextUrl.pathname;

  // Protected routes prefixes
  const isProtected = 
    path.startsWith("/admin") || 
    path.startsWith("/seller") || 
    path.startsWith("/account");

  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based redirects for authenticated users hitting root/auth pages could go here
  // if we could decode the token, but it's an opaque token in DB.
  // So we leave that logic to the pages/layouts.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/account/:path*",
  ],
};
