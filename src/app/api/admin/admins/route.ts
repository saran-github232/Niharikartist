import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, decodeSessionCookie } from "@/lib/adminAuth";
import { approveAdmin, listAdmins, ownerId, removeAdmin, toPublicAdmin } from "@/lib/adminStore";

async function requireSession() {
  const jar = await cookies();
  return decodeSessionCookie(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admins = await listAdmins();
  return NextResponse.json({
    admins: admins.map(toPublicAdmin),
    currentAdminId: session.adminId,
    ownerId: ownerId(admins),
  });
}

export async function DELETE(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Missing admin id." }, { status: 400 });
  if (id === session.adminId) {
    return NextResponse.json({ error: "You can't remove your own account while signed in." }, { status: 400 });
  }

  const admins = await listAdmins();
  if (ownerId(admins) !== session.adminId) {
    return NextResponse.json({ error: "Only the owner can remove other admins." }, { status: 403 });
  }

  const removed = await removeAdmin(id);
  if (!removed) return NextResponse.json({ error: "Admin not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Missing admin id." }, { status: 400 });

  const admins = await listAdmins();
  if (ownerId(admins) !== session.adminId) {
    return NextResponse.json({ error: "Only the owner can approve admins." }, { status: 403 });
  }

  const approved = await approveAdmin(id);
  if (!approved) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
