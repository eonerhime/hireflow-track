import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { getUserFromRequest } from "@/lib/auth";
import { createResumeSchema } from "@/lib/schemas/resume";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resumes = await prisma.resume.findMany({
      where: { userId: user.userId },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        label: true,
        fileUrl: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("[GET /api/resumes]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const labelRaw = formData.get("label");

    // Validate label first — fail fast before touching the file
    const labelResult = createResumeSchema.safeParse({ label: labelRaw });
    if (!labelResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: labelResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Validate file presence
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type — PDF only
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 },
      );
    }

    // Validate file size — 5 MB max
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be 5 MB or smaller" },
        { status: 400 },
      );
    }

    // Convert File to Buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary server-side — API secret never leaves the server
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "raw", folder: "resumes", format: "pdf" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as { secure_url: string; public_id: string });
          },
        )
        .end(buffer);
    });

    const resume = await prisma.resume.create({
      data: {
        userId: user.userId,
        label: labelResult.data.label,
        fileUrl: uploadResult.secure_url,
        fileKey: uploadResult.public_id,
      },
    });

    revalidatePath("/dashboard/resumes");

    return NextResponse.json(
      { id: resume.id, label: resume.label, fileUrl: resume.fileUrl },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/resumes]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
