import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/schemas/auth";
import { generateOtp, otpExpiry } from "@/lib/otp";

const resend = new Resend(process.env.RESEND_API_KEY!);

/**
 * POST /api/auth/register
 * Auth: None (public endpoint)
 *
 * Starts registration: validates the email/password, then emails a 6-digit
 * OTP. No User row is created here — only once POST /api/auth/register/verify
 * confirms the OTP does the real account get created. Submitting this route
 * again for the same email overwrites any prior pending code (acts as an
 * implicit resend).
 *
 * Request body:
 *   { email: string, password: string }
 *
 * Responses:
 *   200 — { message: "Verification code sent" }
 *   400 — Validation failed { error, details }
 *   409 — Email already registered { error }
 *   500 — Internal server error { error }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.pendingRegistration.upsert({
      where: { email },
      create: {
        email,
        password: hashedPassword,
        otpHash,
        expiresAt: otpExpiry(),
      },
      update: {
        password: hashedPassword,
        otpHash,
        expiresAt: otpExpiry(),
      },
    });

    await resend.emails.send({
      from: "HireFlow <onboarding@resend.dev>",
      to: email,
      subject: "Your HireFlow verification code",
      text: `Your verification code is ${otp}. It expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
    });

    return NextResponse.json(
      { message: "Verification code sent" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
