import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, decodeSessionCookie, encodeSessionCookie, isAuthConfigured } from "@/lib/adminAuth";
import { registerAdmin } from "@/lib/adminStore";

export async function POST(req: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin registration isn't configured yet. Set AUTH_SECRET." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A name and a valid email are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const result = await registerAdmin(name, email, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  // Every registration after the very first is a request that sits pending
  // until the Owner approves it — no session for those. Only the bootstrap
  // admin (nobody yet to approve them) is auto-approved and logged in.
  if (result.admin.status === "pending") {
    return NextResponse.json({ ok: true, pending: true });
  }

  const res = NextResponse.json({ ok: true, pending: false });

  // If an admin is already signed in (adding a teammate from the Team page),
  // leave their session alone — don't log them out into the new account.
  // Only auto-login when this is a true self-signup (no session yet).
  const jar = await cookies();
  const alreadySignedIn = decodeSessionCookie(jar.get(ADMIN_COOKIE)?.value);
  if (!alreadySignedIn) {
    res.cookies.set(ADMIN_COOKIE, encodeSessionCookie(result.admin.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return res;
}
