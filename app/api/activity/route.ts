import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/activity
 * Auth: Required (JWT cookie)
 *
 * Returns the most recent activity log entries for the authenticated user.
 *
 * Query params (optional):
 *   from — ISO date string — filter createdAt >= from
 *   to   — ISO date string — filter createdAt <= to
 *   Both must be provided together; if either is missing the filter is ignored.
 *
 * Response shape:
 *   ActivityLog[]  (max 20, ordered desc by createdAt)
 *
 * Responses:
 *   200 — Array of activity log objects
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter =
      from && to ? { gte: new Date(from), lte: new Date(to) } : undefined;

    const activity = await prisma.activityLog.findMany({
      where: {
        userId: session.user.id,
        ...(dateFilter && { createdAt: dateFilter }),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("[GET /api/activity]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
