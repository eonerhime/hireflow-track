import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyOtpSchema } from "@/lib/schemas/auth";

/**
 * POST /api/auth/register/verify
 * Auth: None (public endpoint)
 *
 * Confirms the OTP sent by POST /api/auth/register and, only on success,
 * creates the real User account from the pending registration.
 *
 * Request body:
 *   { email: string, otp: string }
 *
 * Responses:
 *   201 — { message: "Account created successfully" }
 *   400 — Validation failed, expired code, or incorrect code { error, details? }
 *   404 — No pending registration for this email { error }
 *   409 — Email already registered { error }
 *   500 — Internal server error { error }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = verifyOtpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, otp } = result.data;

    const pending = await prisma.pendingRegistration.findUnique({
      where: { email },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "No pending registration found for this email" },
        { status: 404 },
      );
    }

    if (pending.expiresAt < new Date()) {
      await prisma.pendingRegistration.delete({ where: { email } });
      return NextResponse.json(
        { error: "Verification code expired. Please register again." },
        { status: 400 },
      );
    }

    const valid = await bcrypt.compare(otp, pending.otpHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect verification code" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.pendingRegistration.delete({ where: { email } });
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    await prisma.user.create({
      data: {
        email,
        password: pending.password,
      },
      select: { id: true },
    });

    await prisma.pendingRegistration.delete({ where: { email } });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/auth/register/verify]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
