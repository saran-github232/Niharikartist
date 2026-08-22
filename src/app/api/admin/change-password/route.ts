import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, decodeSessionCookie } from "@/lib/adminAuth";
import { findAdminById, setAdminPassword } from "@/lib/adminStore";
import { verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const session = decodeSessionCookie(jar.get(ADMIN_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const admin = await findAdminById(session.adminId);
  if (!admin || !verifyPassword(currentPassword, admin.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }
  if (currentPassword === newPassword) {
    return NextResponse.json({ error: "New password must be different from the current one." }, { status: 400 });
  }

  await setAdminPassword(session.adminId, newPassword);
  return NextResponse.json({ ok: true });
}
