// app/api/contacts/route.ts
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createContactSchema } from "@/lib/schemas/contact";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/contacts
 * Auth: Required (JWT cookie)
 *
 * Creates a contact associated with an application owned by the authenticated user.
 * The applicationId in the request body must belong to the authenticated user.
 *
 * Request body:
 *   { applicationId: string, name: string, role?: string,
 *     email?: string, phone?: string, notes?: string }
 *
 * Responses:
 *   201 — Contact object created
 *   400 — Validation failed { error }
 *   401 — Unauthorized { error }
 *   404 — Application not found or not owned by user { error }
 */
export async function POST(request: NextRequest) {
  // Inside your API route handler:
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json();
  const result = createContactSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );

  // Verify the application belongs to the user
  const application = await prisma.application.findFirst({
    where: {
      id: result.data.applicationId,
      userId: userId,
      deletedAt: null,
    },
  });
  if (!application)
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );

  const contact = await prisma.contact.create({ data: result.data });
  return NextResponse.json(contact, { status: 201 });
}
