// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
const PUBLIC_API_ROUTES = [
  "/api/auth",
  "/api/auth/register",
  "/api/reminders/send",
];
// Exempt from IP rate limiting specifically (trusted cron trigger,
// authenticated separately via CRON_SECRET) — distinct from
// PUBLIC_API_ROUTES, which only controls the session-check bypass below.
// Public routes are NOT rate-limit exempt by default: /api/auth/register
// and /api/auth/register/verify are public but must still be throttled,
// since the latter is a brute-forceable 6-digit code check.
const RATE_LIMIT_EXEMPT_ROUTES = ["/api/reminders/send"];
// Routes that authenticate via EITHER a NextAuth session or an API key
// (see lib/auth-helpers.ts's getAuthenticatedUser) — middleware must not
// enforce a session-only gate ahead of these, or key-only clients like the
// browser extension can never actually reach them.
const API_KEY_ELIGIBLE_ROUTES = ["/api/extension"];

// Rate limiting configurations
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60;
const MUTATING_METHODS = new Set(["POST", "PATCH", "DELETE"]);

// Note: In production Edge Runtimes, consider Upstash Redis for persistent tracking.
// We keep this lightweight Map safe from breaking edge builds by checking whitelists first.
const rateLimitStore = new Map<
  string,
  { count: number; windowStart: number }
>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api");
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isPublicApiRoute = PUBLIC_API_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isApiKeyEligibleRoute = API_KEY_ELIGIBLE_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isRateLimitExempt = RATE_LIMIT_EXEMPT_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Rate limiting — mutating API routes only. Runs even for routes that are
  // public or API-key-eligible below: being reachable without a session
  // doesn't mean a route should be unthrottled (e.g. the OTP verify
  // endpoint, which is brute-forceable and must not skip this).
  if (
    isApiRoute &&
    MUTATING_METHODS.has(request.method) &&
    !isRateLimitExempt
  ) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const allowed = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        },
      );
    }
  }

  // 1. CRITICAL: Immediately grant exit execution for public cron paths
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // These routes check for a session OR an API key themselves — don't
  // reject key-only requests here before they get that chance.
  if (isApiKeyEligibleRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
