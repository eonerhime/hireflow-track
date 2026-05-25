import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { getUserFromRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * DELETE /api/resumes/[id]
 * Auth: Required (JWT cookie)
 *
 * Deletes a resume. Cloudinary deletion runs first — if it fails the DB
 * record is NOT deleted and 500 is returned. Any applications linked to
 * this resume have resumeId set to null before the record is deleted.
 *
 * Responses:
 *   200 — { message: "Resume deleted" }
 *   401 — Unauthorized { error }
 *   404 — Resume not found or not owned by user { error }
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

    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.userId },
    });

    if (!resume)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete from Cloudinary first — if this fails, do not delete the DB record
    await cloudinary.uploader.destroy(resume.fileKey, {
      resource_type: "raw",
    });

    // Unlink from any applications before deleting the resume record
    await prisma.application.updateMany({
      where: { resumeId: id },
      data: { resumeId: null },
    });

    await prisma.resume.delete({ where: { id } });

    revalidatePath("/dashboard/resumes");
    revalidatePath("/dashboard");

    return NextResponse.json({ message: "Resume deleted" });
  } catch (error) {
    console.error("[DELETE /api/resumes/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
