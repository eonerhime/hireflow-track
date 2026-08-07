import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/schemas/auth";
import { hashResetToken } from "@/lib/password-reset";

/**
 * POST /api/auth/reset-password
 * Auth: None (public endpoint — the token itself is the credential)
 *
 * Consumes a password reset token and sets a new password. Single-use:
 * the token (and any other stray tokens for the same user) is deleted
 * after a successful reset.
 *
 * Request body:
 *   { token: string, newPassword: string, confirmPassword: string }
 *
 * Responses:
 *   200 — { message: "Password updated successfully" }
 *   400 — Validation failed, or invalid/expired token { error, details? }
 *   500 — Internal server error { error }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { token, newPassword } = result.data;
    const tokenHash = hashResetToken(token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      if (resetToken) {
        await prisma.passwordResetToken.delete({
          where: { id: resetToken.id },
        });
      }
      return NextResponse.json(
        {
          error:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    });

    // Single-use — remove this token and any other stray tokens for the user.
    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[POST /api/auth/reset-password]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
