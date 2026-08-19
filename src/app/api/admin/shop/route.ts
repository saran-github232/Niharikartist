import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidSession } from "@/lib/adminAuth";
import { getEffectiveShopArtworks, setShopOverride } from "@/lib/shopOverrides";
import { shopArtworks } from "@/data/shop";

async function requireSession() {
  const jar = await cookies();
  return isValidSession(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ items: await getEffectiveShopArtworks() });
}

export async function POST(req: NextRequest) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!shopArtworks.some((a) => a.slug === slug)) {
    return NextResponse.json({ error: "Unknown artwork." }, { status: 404 });
  }

  const patch: { price?: number; available?: boolean } = {};
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number." }, { status: 400 });
    }
    patch.price = price;
  }
  if (body.available !== undefined) {
    if (typeof body.available !== "boolean") {
      return NextResponse.json({ error: "Availability must be true or false." }, { status: 400 });
    }
    patch.available = body.available;
  }

  await setShopOverride(slug, patch);

  // Purges the cached HTML for these pages so the next visitor sees the
  // edit immediately, without waiting for a rebuild/redeploy.
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);

  return NextResponse.json({ ok: true });
}
