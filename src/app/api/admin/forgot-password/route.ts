import { NextRequest, NextResponse } from "next/server";
import { isAuthConfigured, makeResetToken } from "@/lib/adminAuth";
import { findAdminByEmail } from "@/lib/adminStore";
import { sendPasswordResetEmail } from "@/lib/email";

const GENERIC_MESSAGE = "If that email belongs to an admin account, a reset link has been sent.";

export async function POST(req: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Admin auth isn't configured yet. Set AUTH_SECRET." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const origin = req.nextUrl.origin;

  const admin = email ? await findAdminByEmail(email) : undefined;
  if (admin) {
    const token = makeResetToken(admin.id, admin.passwordHash);
    const resetUrl = `${origin}/admin/reset-password?token=${token}`;
    await sendPasswordResetEmail(admin.email, resetUrl);
  }

  // Same response whether or not the account exists — don't let this
  // endpoint be used to check which emails have admin accounts.
  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
