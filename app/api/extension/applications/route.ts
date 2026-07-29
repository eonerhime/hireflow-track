import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { extensionApplicationSchema } from "@/lib/schemas/extension";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = extensionApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { company, role, location, jobUrl, source, notes } = parsed.data;

  // Duplicate detection — same user, same jobUrl
  const existing = await prisma.application.findFirst({
    where: { userId: auth.userId, jobUrl, deletedAt: null },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already tracked", applicationId: existing.id },
      { status: 409 },
    );
  }

  const application = await prisma.application.create({
    data: {
      userId: auth.userId,
      company,
      role,
      location,
      jobUrl,
      source,
      stage: "APPLIED",
      notes: notes ?? undefined,
    },
  });

  void logActivity({
    userId: auth.userId,
    applicationId: application.id,
    action: "APPLICATION_CREATED_VIA_EXTENSION",
    metadata: { company: application.company, role: application.role, source },
  });

  return NextResponse.json(
    {
      id: application.id,
      company: application.company,
      role: application.role,
      createdAt: application.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
