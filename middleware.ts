// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const PUBLIC_API_ROUTES = [
  "/api/auth",
  "/api/auth/login",
  "/api/auth/register",
  "/api/reminders/send",
];

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

  // 1. CRITICAL: Immediately grant exit execution for public cron paths
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Rate limiting — mutating API routes only (safely skipped for /api/reminders/send)
  if (isApiRoute && MUTATING_METHODS.has(request.method)) {
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
