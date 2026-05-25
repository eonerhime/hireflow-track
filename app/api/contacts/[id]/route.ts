// app/api/contacts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { updateContactSchema } from "@/lib/schemas/contact";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/contacts/[id]
 * Auth: Required (JWT cookie)
 *
 * Updates a contact. Ownership is verified via the parent application.
 *
 * Request body (all fields optional, at least one required):
 *   { name?: string, role?: string, email?: string,
 *     phone?: string, notes?: string }
 *
 * Responses:
 *   200 — Updated Contact object
 *   400 — Validation failed { error }
 *   401 — Unauthorized { error }
 *   404 — Contact not found or not owned by user { error }
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const result = updateContactSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );

  // Verify contact belongs to the user via application
  const contact = await prisma.contact.findFirst({
    where: { id, application: { userId: user.userId } },
  });
  if (!contact)
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const updated = await prisma.contact.update({
    where: { id },
    data: result.data,
  });
  return NextResponse.json(updated);
}

/**
 * DELETE /api/contacts/[id]
 * Auth: Required (JWT cookie)
 *
 * Hard-deletes a contact. Ownership is verified via the parent application.
 *
 * Responses:
 *   200 — { message: "Contact deleted" }
 *   401 — Unauthorized { error }
 *   404 — Contact not found or not owned by user { error }
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, application: { userId: user.userId } },
  });
  if (!contact)
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ message: "Contact deleted" });
}
