import { promises as fs } from "fs";
import path from "path";
import { shopArtworks, type ShopArtwork } from "@/data/shop";

// Admin-edited fields only, keyed by slug — layered onto the existing
// shopArtworks data at read time rather than replacing it. Keeps the
// original data file as the seed/fallback and the diff small.
//
// IMPORTANT: this writes to the local filesystem. That's real, durable
// storage on a traditional Node server or in local dev, but on typical
// serverless hosting (Vercel, Netlify functions) the filesystem is
// ephemeral — a write from one request is not guaranteed to be visible on
// the next. If this ever deploys to serverless, swap readOverrides/
// writeOverrides for a small persistent store (Vercel KV, a database) —
// nothing else in the admin UI or the shop pages needs to change, they
// only know about getEffectiveShopArtworks()/setShopOverride().
export interface ShopOverride {
  price?: number;
  available?: boolean;
}

const FILE_PATH = path.join(process.cwd(), "data", "shop-overrides.json");

async function readOverrides(): Promise<Record<string, ShopOverride>> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function writeOverrides(overrides: Record<string, ShopOverride>): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(overrides, null, 2) + "\n", "utf8");
}

export async function getEffectiveShopArtworks(): Promise<ShopArtwork[]> {
  const overrides = await readOverrides();
  return shopArtworks.map((art) => ({ ...art, ...overrides[art.slug] }));
}

export async function getEffectiveShopArtwork(slug: string): Promise<ShopArtwork | undefined> {
  const base = shopArtworks.find((a) => a.slug === slug);
  if (!base) return undefined;
  const overrides = await readOverrides();
  return { ...base, ...overrides[slug] };
}

export async function setShopOverride(slug: string, patch: ShopOverride): Promise<void> {
  const overrides = await readOverrides();
  overrides[slug] = { ...overrides[slug], ...patch };
  await writeOverrides(overrides);
}
