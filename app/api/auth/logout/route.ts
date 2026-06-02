import { NextResponse } from "next/server";

const COOKIE_NAME = "hireflow-track-token";

/**
 * POST /api/auth/logout
 * Auth: None required (clears the cookie regardless of validity)
 *
 * Clears the hireflow-track-token cookie by overwriting it with an empty value
 * and maxAge: 0.
 *
 * Responses:
 *   200 — { message: "Logged out" }
 */
export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out" },
    { status: 200 },
  );

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
