import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

// Local dev has no Redis credentials — reads/writes fall back to a local
// JSON file under data/, so `npm run dev` behaves exactly as before. On
// Vercel, KV_REST_API_URL/KV_REST_API_TOKEN come from the Upstash
// integration (Vercel dashboard → Storage → Marketplace → Upstash) and
// every read/write goes through Redis instead — Vercel's serverless
// filesystem is read-only, so writing to data/*.json there fails outright.
const redis = process.env.KV_REST_API_URL ? Redis.fromEnv() : null;

const LOCAL_DIR = path.join(process.cwd(), "data");

export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  if (redis) {
    const value = await redis.get<T>(key);
    return value ?? fallback;
  }
  try {
    const raw = await fs.readFile(path.join(LOCAL_DIR, `${key}.json`), "utf8");
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  if (redis) {
    await redis.set(key, value);
    return;
  }
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, `${key}.json`), JSON.stringify(value, null, 2) + "\n", "utf8");
}
