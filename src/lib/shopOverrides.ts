import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { shopArtworks, type ShopArtwork } from "@/data/shop";
import { slugify } from "./slug";

// Two file-backed JSON stores, both layered onto the existing shopArtworks
// array at read time rather than replacing it:
//   - shop-overrides.json: admin-edited {price, available} keyed by slug,
//     for pieces that already exist in shop.ts.
//   - shop-additions.json: whole new ShopArtwork entries created via the
//     admin "Add Product" form (never in shop.ts, which stays the seed
//     data — nothing here rewrites source files).
//
// IMPORTANT: this writes to the local filesystem. That's real, durable
// storage on a traditional Node server or in local dev, but on typical
// serverless hosting (Vercel, Netlify functions) the filesystem is
// ephemeral — a write from one request is not guaranteed to be visible on
// the next. If this ever deploys to serverless, swap the read/write
// functions below for a small persistent store (Vercel KV, a database) —
// nothing else in the admin UI or the shop pages needs to change, they only
// know about getEffectiveShopArtworks() / setShopOverride() / addShopArtwork().
export interface ShopOverride {
  price?: number;
  available?: boolean;
  /** Soft-delete for seed items (src/data/shop.ts is never rewritten at runtime). */
  deleted?: boolean;
}

const OVERRIDES_PATH = path.join(process.cwd(), "data", "shop-overrides.json");
const ADDITIONS_PATH = path.join(process.cwd(), "data", "shop-additions.json");

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function readOverrides(): Promise<Record<string, ShopOverride>> {
  const data = await readJson<Record<string, ShopOverride>>(OVERRIDES_PATH, {});
  return typeof data === "object" && data !== null ? data : {};
}

async function readAdditions(): Promise<ShopArtwork[]> {
  const data = await readJson<ShopArtwork[]>(ADDITIONS_PATH, []);
  return Array.isArray(data) ? data : [];
}

async function baseWithAdditions(): Promise<ShopArtwork[]> {
  return [...shopArtworks, ...(await readAdditions())];
}

export async function getEffectiveShopArtworks(): Promise<ShopArtwork[]> {
  const [all, overrides] = await Promise.all([baseWithAdditions(), readOverrides()]);
  return all
    .filter((art) => !overrides[art.slug]?.deleted)
    .map((art) => ({ ...art, ...overrides[art.slug] }));
}

export async function getEffectiveShopArtwork(slug: string): Promise<ShopArtwork | undefined> {
  const all = await baseWithAdditions();
  const base = all.find((a) => a.slug === slug);
  if (!base) return undefined;
  const overrides = await readOverrides();
  if (overrides[slug]?.deleted) return undefined;
  return { ...base, ...overrides[slug] };
}

/** Additions (admin-added products) are removed outright; seed items (from
 *  src/data/shop.ts, never rewritten at runtime) are soft-deleted via an
 *  override instead. */
export async function deleteShopArtwork(slug: string): Promise<boolean> {
  const additions = await readAdditions();
  if (additions.some((a) => a.slug === slug)) {
    await writeJson(ADDITIONS_PATH, additions.filter((a) => a.slug !== slug));
    const overrides = await readOverrides();
    if (slug in overrides) {
      delete overrides[slug];
      await writeJson(OVERRIDES_PATH, overrides);
    }
    return true;
  }

  if (!shopArtworks.some((a) => a.slug === slug)) return false;
  await setShopOverride(slug, { deleted: true });
  return true;
}

export async function setShopOverride(slug: string, patch: ShopOverride): Promise<void> {
  const overrides = await readOverrides();
  overrides[slug] = { ...overrides[slug], ...patch };
  await writeJson(OVERRIDES_PATH, overrides);
}

/** Applies several {slug, ...patch} entries in one write — the "Save All" path. */
export async function setShopOverrides(
  patches: Array<{ slug: string } & ShopOverride>
): Promise<void> {
  const overrides = await readOverrides();
  for (const { slug, ...patch } of patches) {
    overrides[slug] = { ...overrides[slug], ...patch };
  }
  await writeJson(OVERRIDES_PATH, overrides);
}

export interface NewShopArtworkInput {
  title: string;
  description: string;
  price: number;
  available: boolean;
  imageUrl: string;
}

export async function addShopArtwork(
  input: NewShopArtworkInput
): Promise<{ ok: true; artwork: ShopArtwork } | { ok: false; error: string }> {
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  if (!input.imageUrl.trim()) return { ok: false, error: "An image is required." };
  if (input.imageUrl.length > 3_000_000) {
    return { ok: false, error: "That image is too large. Try a smaller photo." };
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    return { ok: false, error: "Price must be a non-negative number." };
  }

  const all = await baseWithAdditions();
  const baseSlug = slugify(input.title);
  let slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
  // Vanishingly unlikely to collide given the random suffix, but stay correct.
  while (all.some((a) => a.slug === slug)) {
    slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
  }

  const artwork: ShopArtwork = {
    id: crypto.randomUUID(),
    slug,
    title: input.title.trim(),
    description: input.description.trim(),
    price: input.price,
    available: input.available,
    imageUrl: input.imageUrl.trim(),
  };

  const additions = await readAdditions();
  additions.push(artwork);
  await writeJson(ADDITIONS_PATH, additions);
  return { ok: true, artwork };
}
