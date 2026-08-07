import { randomBytes, createHash } from "crypto";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function generateResetToken(): string {
  return randomBytes(32).toString("base64url");
}

// Reset tokens are high-entropy (32 random bytes), unlike passwords/OTPs —
// a fast deterministic hash is safe here and enables a direct DB lookup
// instead of bcrypt's iterate-and-compare pattern used for low-entropy secrets.
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function resetTokenExpiry(): Date {
  return new Date(Date.now() + RESET_TOKEN_TTL_MS);
}
