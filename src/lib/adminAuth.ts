import crypto from "crypto";

// Sessions and reset links are both stateless HMAC-signed tokens (no session
// or token-store table needed) — verifying just means recomputing the same
// HMAC and comparing. AUTH_SECRET is the one shared server secret this all
// derives from; treat it like any other credential (never commit it).
export const ADMIN_COOKIE = "admin_session";
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function authSecret(): string {
  return process.env.AUTH_SECRET ?? "";
}

export function isAuthConfigured(): boolean {
  return authSecret().length > 0;
}

export function sessionToken(adminId: string): string {
  return crypto.createHmac("sha256", authSecret()).update(`session:${adminId}`).digest("hex");
}

export function isValidSession(adminId: string | undefined, token: string | undefined): boolean {
  if (!adminId || !token || !isAuthConfigured()) return false;
  const expected = sessionToken(adminId);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// The cookie carries both the admin's id and their session token (id.token)
// so a request can be verified without any server-side session lookup.
export function encodeSessionCookie(adminId: string): string {
  return `${adminId}.${sessionToken(adminId)}`;
}

export function decodeSessionCookie(cookieValue: string | undefined): { adminId: string } | null {
  if (!cookieValue) return null;
  const dot = cookieValue.indexOf(".");
  if (dot === -1) return null;
  const adminId = cookieValue.slice(0, dot);
  const token = cookieValue.slice(dot + 1);
  return isValidSession(adminId, token) ? { adminId } : null;
}

// The current password hash is mixed into the signature (not just the
// secret) so a reset link stops working the moment it's used once — the
// password change it causes invalidates its own token, without needing a
// used-tokens table.
export function makeResetToken(adminId: string, passwordHash: string): string {
  const expiry = Date.now() + RESET_TOKEN_TTL_MS;
  const payload = `${adminId}:${expiry}`;
  const sig = crypto.createHmac("sha256", authSecret() + passwordHash).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

/** Reads the (unverified) admin id out of a reset token, so the caller can look up the password hash needed to verify it. */
export function peekResetTokenAdminId(token: string): string | null {
  try {
    const [adminId] = Buffer.from(token, "base64url").toString("utf8").split(":");
    return adminId || null;
  } catch {
    return null;
  }
}

export function verifyResetToken(token: string, passwordHash: string): { adminId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [adminId, expiryStr, sig] = decoded.split(":");
    if (!adminId || !expiryStr || !sig) return null;
    if (Date.now() > Number(expiryStr)) return null;

    const expectedSig = crypto
      .createHmac("sha256", authSecret() + passwordHash)
      .update(`${adminId}:${expiryStr}`)
      .digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    return { adminId };
  } catch {
    return null;
  }
}
