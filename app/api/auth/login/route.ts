import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas/auth";
import { signJWT } from "@/lib/jwt";

const COOKIE_NAME = "hiretrace-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * POST /api/auth/login
 * Auth: None (public endpoint)
 *
 * Authenticates a user and sets an HTTP-only JWT cookie on success.
 * Returns a generic error for both "user not found" and "wrong password"
 * to prevent user enumeration.
 *
 * Request body:
 *   { email: string, password: string }
 *
 * Responses:
 *   200 — { message: "Login successful" } + sets hiretrace-token cookie
 *   400 — Validation failed { error, details }
 *   401 — Invalid credentials { error }
 *   500 — Internal server error { error }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    // Find user — generic error if not found (prevents user enumeration)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Sign JWT
    const token = await signJWT({ userId: user.id, email: user.email });

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 },
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
