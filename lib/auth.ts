// lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

interface JWTPayload {
  userId: string;
  email: string;
}

export async function getUserFromRequest(
  _request: NextRequest,
): Promise<JWTPayload | null> {
  // Try NextAuth session first (current auth system)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { userId: session.user.id, email: session.user.email ?? "" };
  }

  // Fall back to legacy jose cookie (transition period)
  const token = _request.cookies.get("hiretrace-token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
