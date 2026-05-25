import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

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