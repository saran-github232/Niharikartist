import crypto from "crypto";

// Node's built-in scrypt — no reason to add a bcrypt/argon2 dependency for
// this. Stored as "salt:hash" (both hex) so verification is self-contained.
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const testHash = crypto.scryptSync(password, salt, 64);
  return hashBuffer.length === testHash.length && crypto.timingSafeEqual(hashBuffer, testHash);
}
