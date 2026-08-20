import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, decodeSessionCookie } from "@/lib/adminAuth";
import {
  deleteShopArtwork,
  getEffectiveShopArtworks,
  setShopOverride,
  setShopOverrides,
} from "@/lib/shopOverrides";
import { shopArtworks } from "@/data/shop";

async function requireSession() {
  const jar = await cookies();
  return decodeSessionCookie(jar.get(ADMIN_COOKIE)?.value);
}

function parsePatch(body: { price?: unknown; available?: unknown }):
  | { ok: true; patch: { price?: number; available?: boolean } }
  | { ok: false; error: string } {
  const patch: { price?: number; available?: boolean } = {};
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, error: "Price must be a non-negative number." };
    }
    patch.price = price;
  }
  if (body.available !== undefined) {
    if (typeof body.available !== "boolean") {
      return { ok: false, error: "Availability must be true or false." };
    }
    patch.available = body.available;
  }
  return { ok: true, patch };
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

  const parsed = parsePatch(body ?? {});
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await setShopOverride(slug, parsed.patch);

  // Purges the cached HTML for these pages so the next visitor sees the
  // edit immediately, without waiting for a rebuild/redeploy.
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);

  return NextResponse.json({ ok: true });
}

/** Batch save — the "Save All" path. Body: { items: [{slug, price?, available?}] } */
export async function PUT(req: NextRequest) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : null;
  if (!items) return NextResponse.json({ error: "Expected an items array." }, { status: 400 });

  const patches: Array<{ slug: string; price?: number; available?: boolean }> = [];
  for (const item of items) {
    const slug = typeof item?.slug === "string" ? item.slug : "";
    if (!shopArtworks.some((a) => a.slug === slug)) {
      return NextResponse.json({ error: `Unknown artwork: ${slug}` }, { status: 404 });
    }
    const parsed = parsePatch(item ?? {});
    if (!parsed.ok) return NextResponse.json({ error: `${slug}: ${parsed.error}` }, { status: 400 });
    patches.push({ slug, ...parsed.patch });
  }

  await setShopOverrides(patches);

  revalidatePath("/shop");
  for (const { slug } of patches) revalidatePath(`/shop/${slug}`);

  return NextResponse.json({ ok: true, count: patches.length });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const removed = await deleteShopArtwork(slug);
  if (!removed) return NextResponse.json({ error: "Unknown artwork." }, { status: 404 });

  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);

  return NextResponse.json({ ok: true });
}
