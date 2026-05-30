// app/api/applications/route.ts
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createApplicationSchema } from "@/lib/schemas/application";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/applications
 * Auth: Required (JWT cookie)
 *
 * Creates a new job application for the authenticated user.
 *
 * Request body:
 *   { company: string, role: string, location?: string, salary?: string,
 *     jobUrl?: string, followUpAt?: string, notes?: string, source?: string }
 *
 * Responses:
 *   201 — Application object created
 *   400 — Validation failed { error, details }
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const result = createApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      company,
      role,
      location,
      salary,
      jobUrl,
      followUpAt,
      notes,
      resumeVersionLabel,
    } = result.data;

    const application = await prisma.application.create({
      data: {
        userId: userId,
        company,
        role,
        location: location || null,
        salary: salary || null,
        jobUrl: jobUrl || null,
        followUpAt: followUpAt ? new Date(followUpAt) : null,
        notes: notes || null,
        resumeVersionLabel: resumeVersionLabel || null,
      },
    });
    revalidatePath("/dashboard");

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("[POST /api/applications]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/applications
 * Auth: Required (JWT cookie)
 *
 * Returns all non-deleted applications for the authenticated user,
 * ordered by updatedAt descending.
 *
 * Responses:
 *   200 — Application[] (may be empty)
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const applications = await prisma.application.findMany({
      where: {
        userId: userId,
        deletedAt: null, // exclude soft-deleted
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("[GET /api/applications]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
