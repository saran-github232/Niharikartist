import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, decodeSessionCookie } from "@/lib/adminAuth";
import { listAdmins, ownerId, transferOwnership } from "@/lib/adminStore";

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const session = decodeSessionCookie(jar.get(ADMIN_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const newOwnerId = typeof body?.id === "string" ? body.id : "";
  if (!newOwnerId) return NextResponse.json({ error: "Missing admin id." }, { status: 400 });

  const admins = await listAdmins();
  if (ownerId(admins) !== session.adminId) {
    return NextResponse.json({ error: "Only the current owner can transfer ownership." }, { status: 403 });
  }
  if (newOwnerId === session.adminId) {
    return NextResponse.json({ error: "You're already the owner." }, { status: 400 });
  }

  const ok = await transferOwnership(session.adminId, newOwnerId);
  if (!ok) return NextResponse.json({ error: "Couldn't transfer ownership to that admin." }, { status: 400 });

  return NextResponse.json({ ok: true });
}
