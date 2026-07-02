import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { validateApiKey } from "@/lib/api-key";
import { NextRequest } from "next/server";

interface AuthResult {
  userId: string;
  via: "session" | "apiKey";
}

/**
 * Accepts either a NextAuth session OR a valid API key in the
 * Authorization header. Used by routes that must support both the
 * dashboard (session) and the extension (API key).
 */
export async function getAuthenticatedUser(
  req: NextRequest,
): Promise<AuthResult | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { userId: session.user.id, via: "session" };
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const rawKey = authHeader.slice("Bearer ".length).trim();
    const result = await validateApiKey(rawKey);
    if (result) return { userId: result.userId, via: "apiKey" };
  }

  return null;
}
