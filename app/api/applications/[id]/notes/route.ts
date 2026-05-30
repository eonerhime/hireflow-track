// app/api/applications/[id]/notes/route.ts
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "@/lib/schemas/note";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/applications/[id]/notes
 * Auth: Required (JWT cookie)
 *
 * Creates an interview note for the specified application.
 * Validates the request body before the DB ownership check (fail-fast on 400).
 *
 * Request body:
 *   { stage: ApplicationStage, content: string }
 *
 * Responses:
 *   201 — InterviewNote object created
 *   400 — Validation failed { error, details }
 *   401 — Unauthorized { error }
 *   404 — Application not found or not owned by user { error }
 *   500 — Internal server error { error }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Validate body BEFORE the DB lookup — returns 400 on bad input
    const body = await request.json();
    const result = createNoteSchema.safeParse(body);
    if (!result.success)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );

    // Now check the application exists and belongs to this user
    const application = await prisma.application.findFirst({
      where: { id, userId: userId, deletedAt: null },
    });
    if (!application)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const note = await prisma.interviewNote.create({
      data: {
        applicationId: id,
        stage: result.data.stage,
        content: result.data.content,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/applications/${id}`);

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("[POST /api/applications/[id]/notes]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
