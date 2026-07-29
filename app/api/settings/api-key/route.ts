import { logActivity } from "@/lib/activity";
import { generateApiKey, revokeApiKey } from "@/lib/api-key";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawKey = await generateApiKey(session.user.id);

  void logActivity({
    userId: session.user.id,
    action: "API_KEY_GENERATED",
    metadata: undefined,
  });

  // Plaintext key is returned ONCE — never retrievable again
  return NextResponse.json({ apiKey: rawKey }, { status: 201 });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await revokeApiKey(session.user.id);

  void logActivity({
    userId: session.user.id,
    action: "API_KEY_REVOKED",
    metadata: undefined,
  });

  return NextResponse.json({ revoked: true });
}
