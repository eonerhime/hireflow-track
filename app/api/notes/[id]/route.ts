import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateNoteSchema } from "@/lib/schemas/note";
import { getUserFromRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getOwnedNote(userId: string, noteId: string) {
  return prisma.interviewNote.findFirst({
    where: { id: noteId, application: { userId, deletedAt: null } },
    include: { application: true },
  });
}

/**
 * PATCH /api/notes/[id]
 * Auth: Required (JWT cookie)
 *
 * Updates an interview note. Ownership is verified via the parent application.
 * At least one field (stage or content) must be provided.
 *
 * Request body:
 *   { stage?: ApplicationStage, content?: string }
 *
 * Responses:
 *   200 — Updated InterviewNote object
 *   400 — Validation failed { error, details }
 *   401 — Unauthorized { error }
 *   404 — Note not found or not owned by user { error }
 *   500 — Internal server error { error }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const note = await getOwnedNote(user.userId, id);
    if (!note)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const result = updateNoteSchema.safeParse(body);
    if (!result.success)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );

    const updated = await prisma.interviewNote.update({
      where: { id },
      data: result.data,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/applications/${note.applicationId}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/notes/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/notes/[id]
 * Auth: Required (JWT cookie)
 *
 * Hard-deletes an interview note. Ownership is verified via the parent application.
 *
 * Responses:
 *   200 — { message: "Note deleted" }
 *   401 — Unauthorized { error }
 *   404 — Note not found or not owned by user { error }
 *   500 — Internal server error { error }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const note = await getOwnedNote(user.userId, id);
    if (!note)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.interviewNote.delete({ where: { id } });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/applications/${note.applicationId}`);

    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    console.error("[DELETE /api/notes/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
