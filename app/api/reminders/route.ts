import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

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
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reminders = await prisma.application.findMany({
      where: {
        userId: user.userId,
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
