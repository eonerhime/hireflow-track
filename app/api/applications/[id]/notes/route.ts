// app/api/applications/[id]/notes/route.ts
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "@/lib/schemas/note";
import { logActivity } from "@/lib/activity";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

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

    const application = await prisma.application.findFirst({
      where: { id, userId, deletedAt: null },
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

    void logActivity({
      userId,
      applicationId: id,
      action: "NOTE_ADDED",
      metadata: {
        company: application.company,
        role: application.role,
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
