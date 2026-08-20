import { NextRequest, NextResponse } from "next/server";
import { peekResetTokenAdminId, verifyResetToken } from "@/lib/adminAuth";
import { findAdminById, setAdminPassword } from "@/lib/adminStore";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const adminId = peekResetTokenAdminId(token);
  const admin = adminId ? await findAdminById(adminId) : undefined;
  const verified = admin ? verifyResetToken(token, admin.passwordHash) : null;
  if (!verified || !admin) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const updated = await setAdminPassword(verified.adminId, password);
  if (!updated) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
