import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/schemas/auth";
import {
  generateResetToken,
  hashResetToken,
  resetTokenExpiry,
} from "@/lib/password-reset";

const resend = new Resend(process.env.RESEND_API_KEY!);

const GENERIC_MESSAGE =
  "If an account exists for that email, a password reset link has been sent.";

/**
 * POST /api/auth/forgot-password
 * Auth: None (public endpoint)
 *
 * Sends a password reset link if the email belongs to a real,
 * credentials-based account. Always returns the same generic response
 * regardless of whether the email exists, is OAuth-only, or the send
 * failed — this route must not be usable to enumerate registered emails.
 *
 * Request body:
 *   { email: string }
 *
 * Responses:
 *   200 — { message: string } (always, on any non-validation outcome)
 *   400 — Validation failed { error, details }
 *   500 — Internal server error { error }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // No account, or an OAuth-only account with no password to reset —
    // return the same response as success either way.
    if (!user || !user.password) {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    const rawToken = generateResetToken();
    const tokenHash = hashResetToken(rawToken);

    // Only one live reset link per user at a time.
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: resetTokenExpiry() },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`;

    const { error: sendError } = await resend.emails.send({
      from: "HireFlow <onboarding@resend.dev>",
      to: email,
      subject: "Reset your HireFlow password",
      text: `We received a request to reset your password. Click the link below to choose a new one — it expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    });

    if (sendError) {
      // Don't surface this to the caller — doing so only for accounts that
      // exist (the only case where send() is even attempted) would itself
      // leak account existence.
      console.error(
        "[POST /api/auth/forgot-password] Resend error:",
        sendError,
      );
    }

    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
