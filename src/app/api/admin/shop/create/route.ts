import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, decodeSessionCookie } from "@/lib/adminAuth";
import { addShopArtwork } from "@/lib/shopOverrides";

export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!decodeSessionCookie(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const result = await addShopArtwork({
    title: typeof body?.title === "string" ? body.title : "",
    description: typeof body?.description === "string" ? body.description : "",
    price: Number(body?.price),
    available: Boolean(body?.available),
    imageUrl: typeof body?.imageUrl === "string" ? body.imageUrl : "",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/shop");
  return NextResponse.json({ ok: true, artwork: result.artwork });
}
