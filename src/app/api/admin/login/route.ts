import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, encodeSessionCookie, isAuthConfigured } from "@/lib/adminAuth";
import { findAdminByEmail } from "@/lib/adminStore";
import { verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin login isn't configured yet. Set AUTH_SECRET." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const admin = email ? await findAdminByEmail(email) : undefined;
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }
  if (admin.status === "pending") {
    return NextResponse.json(
      { error: "Your registration is awaiting approval from the site owner." },
      { status: 403 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, encodeSessionCookie(admin.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
