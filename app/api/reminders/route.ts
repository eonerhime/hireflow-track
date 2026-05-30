import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * GET /api/reminders
 * Auth: Required (JWT cookie)
 *
 * Returns all active applications with a followUpAt date set for the
 * authenticated user, sorted ascending by followUpAt.
 * Empty array is a valid response — not 404.
 *
 * Response shape:
 *   { id, company, role, stage, followUpAt }[]
 *
 * Responses:
 *   200 — Array of reminder objects
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */
export async function GET() {
  try {
    // Inside your API route handler:
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const reminders = await prisma.application.findMany({
      where: {
        userId: userId,
        deletedAt: null,
        followUpAt: { not: null },
      },
      select: {
        id: true,
        company: true,
        role: true,
        stage: true,
        followUpAt: true,
      },
      orderBy: { followUpAt: "asc" },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("[GET /api/reminders]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
