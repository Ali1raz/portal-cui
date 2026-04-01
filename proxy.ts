import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the full path WITH search params
    const fullPath = request.nextUrl.pathname + request.nextUrl.search;
    loginUrl.searchParams.set("from", fullPath);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/professor/:path*",
    "/student/:path*",
    "/clerk/:path*",
    "/batch-advisor/:path*",
    "/hod/:path*",
    "/apply/:path*",
  ],
};
