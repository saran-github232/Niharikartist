import crypto from "crypto";

// Deliberately stateless: the session "token" is an HMAC derived from the
// admin password, not a random token in a session store — there's no
// database to store sessions in, and this gate isn't meant to be real
// multi-user auth/RBAC (that's the Supabase-backed version, not this one).
// Verifying just means recomputing the same HMAC and comparing.
export const ADMIN_COOKIE = "admin_session";

export function isAdminConfigured(): boolean {
  return typeof process.env.ADMIN_PASSWORD === "string" && process.env.ADMIN_PASSWORD.length > 0;
}

export function isValidPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function sessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  return crypto.createHmac("sha256", secret).update("niharika-admin-session").digest("hex");
}

export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue || !isAdminConfigured()) return false;
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(sessionToken());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
