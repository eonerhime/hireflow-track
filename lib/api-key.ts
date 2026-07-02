import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const KEY_PREFIX = "htk_";

/**
 * Generates a new API key for a user. Revokes any existing active key
 * (v1 supports one active key per user — simpler UX, fewer edge cases).
 * Returns the PLAINTEXT key — this is the only time it is ever available.
 */
export async function generateApiKey(userId: string): Promise<string> {
  const rawKey = KEY_PREFIX + randomBytes(32).toString("base64url");
  const keyHash = await bcrypt.hash(rawKey, 10);

  // Revoke any existing active key for this user
  await prisma.apiKey.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.apiKey.create({
    data: { userId, keyHash, label: "Browser Extension" },
  });

  return rawKey;
}

/**
 * Validates a raw API key against stored hashes.
 * Returns the associated userId if valid and not revoked, otherwise null.
 *
 * Note: bcrypt.compare must be run against every active hash since we
 * cannot look up by hash directly (bcrypt hashes are non-deterministic).
 * With one active key per user, this is a single comparison in practice.
 */
export async function validateApiKey(rawKey: string): Promise<{ userId: string } | null> {
  if (!rawKey.startsWith(KEY_PREFIX)) return null;

  const activeKeys = await prisma.apiKey.findMany({
    where: { revokedAt: null },
    select: { id: true, userId: true, keyHash: true },
  });

  for (const key of activeKeys) {
    const isMatch = await bcrypt.compare(rawKey, key.keyHash);
    if (isMatch) {
      // Fire-and-forget — never block the request on this write
      void prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      });
      return { userId: key.userId };
    }
  }

  return null;
}

export async function revokeApiKey(userId: string): Promise<void> {
  await prisma.apiKey.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}