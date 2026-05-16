import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { env } from "./lib/env";

const protectedRoutes = [
  "/admin",
  "/professor",
  "/student",
  "/clerk",
  "/batch-advisor",
  "/hod",
  "/apply",
];

async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for non-protected routes
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

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

// ✅ Exclude ALL /api/* routes (especially better-auth's /api/auth/*)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/inngest).*)",
  ],
};

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
        "STRIPE_WEBHOOK",
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        "CATEGORY:MONITOR", // Uptime monitoring services
        "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
  ],
});

// Pass any existing middleware with the optional existingMiddleware prop
export const proxy = createMiddleware(aj, async (request: NextRequest) => {
  return authMiddleware(request);
});
