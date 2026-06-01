import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/reminders
 * Auth: Required (JWT cookie)
 *
 * Returns all active applications with a followUpAt date set for the
 * authenticated user, sorted ascending by followUpAt.
 * Empty array is a valid response — not 404.
 *
 * Query params (optional):
 *   from — ISO date string — filter followUpAt >= from
 *   to   — ISO date string — filter followUpAt <= to
 *   Both must be provided together; if either is missing the filter is ignored.
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter =
      from && to ? { gte: new Date(from), lte: new Date(to) } : { not: null };

    const reminders = await prisma.application.findMany({
      where: {
        userId,
        deletedAt: null,
        followUpAt: dateFilter,
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
