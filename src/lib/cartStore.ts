// A tiny external store over localStorage: cart slugs live here, not in React
// state, so useSyncExternalStore can subscribe to them directly. This avoids
// the classic "read localStorage in a mount effect, setState with the
// result" pattern — React 18's stricter hooks rules flag that as an effect
// mutating state it doesn't own, and useSyncExternalStore is the primitive
// built for exactly this (external source, SSR-safe, no hydration mismatch).
const STORAGE_KEY = "niharika-cart";

type Listener = () => void;
const listeners = new Set<Listener>();

let cachedRaw: string | null = null;
let cachedSlugs: string[] = [];
// useSyncExternalStore requires snapshots to be reference-stable when
// nothing changed — a fresh `[]` literal on every call reads as "always
// different" and React warns of a possible infinite loop.
const EMPTY: string[] = [];

function readFromStorage(): string[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedSlugs;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedSlugs = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    cachedSlugs = [];
  }
  return cachedSlugs;
}

function writeToStorage(next: string[]) {
  cachedSlugs = next;
  cachedRaw = JSON.stringify(next);
  try {
    localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // storage unavailable (private browsing, quota) — cart still works in-memory
  }
  listeners.forEach((l) => l());
}

export function getSlugsSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY;
  return readFromStorage();
}

export function getServerSlugsSnapshot(): string[] {
  return EMPTY;
}

export function subscribeSlugs(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addSlug(slug: string): boolean {
  const cur = readFromStorage();
  if (cur.includes(slug)) return false;
  writeToStorage([...cur, slug]);
  return true;
}

export function removeSlug(slug: string): boolean {
  const cur = readFromStorage();
  if (!cur.includes(slug)) return false;
  writeToStorage(cur.filter((s) => s !== slug));
  return true;
}

export function clearSlugs() {
  writeToStorage([]);
}
