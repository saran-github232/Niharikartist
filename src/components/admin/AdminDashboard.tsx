"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ShopArtwork } from "@/data/shop";

type RowState = { price: string; available: boolean; saving: boolean; savedAt: number | null; error: string | null };

export default function AdminDashboard({ initialItems }: { initialItems: ShopArtwork[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      initialItems.map((a) => [
        a.slug,
        { price: String(a.price), available: a.available, saving: false, savedAt: null, error: null },
      ])
    )
  );

  async function save(slug: string) {
    const row = rows[slug];
    if (!row) return;
    setRows((prev) => ({ ...prev, [slug]: { ...prev[slug], saving: true, error: null } }));

    const price = Number(row.price);
    if (!Number.isFinite(price) || price < 0) {
      setRows((prev) => ({
        ...prev,
        [slug]: { ...prev[slug], saving: false, error: "Price must be a non-negative number." },
      }));
      return;
    }

    const res = await fetch("/api/admin/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, price, available: row.available }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setRows((prev) => ({
        ...prev,
        [slug]: { ...prev[slug], saving: false, error: data?.error ?? "Save failed." },
      }));
      return;
    }

    setRows((prev) => ({ ...prev, [slug]: { ...prev[slug], saving: false, savedAt: Date.now() } }));
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Shop</h1>
          <p className="mt-1 text-sm text-stone">
            Update price and availability. Changes appear on the public site immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-stone/30 px-4 py-2 text-sm text-ink hover:border-accent hover:text-accent"
        >
          Log out
        </button>
      </div>

      <ul className="mt-10 divide-y divide-sand/60">
        {initialItems.map((art) => {
          const row = rows[art.slug];
          if (!row) return null;
          return (
            <li key={art.slug} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-sand">
                <Image
                  src={art.imageUrl}
                  alt={art.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{art.title}</p>
                <p className="text-xs text-stone">/shop/{art.slug}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-stone">
                  ₹
                  <input
                    type="number"
                    min={0}
                    value={row.price}
                    onChange={(e) =>
                      setRows((prev) => ({ ...prev, [art.slug]: { ...prev[art.slug], price: e.target.value } }))
                    }
                    className="w-24 rounded-md border border-sand bg-ivory px-2 py-1.5 text-ink focus:border-accent"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm text-stone">
                  <input
                    type="checkbox"
                    checked={row.available}
                    onChange={(e) =>
                      setRows((prev) => ({
                        ...prev,
                        [art.slug]: { ...prev[art.slug], available: e.target.checked },
                      }))
                    }
                    className="size-4 accent-accent"
                  />
                  Available
                </label>

                <button
                  type="button"
                  onClick={() => save(art.slug)}
                  disabled={row.saving}
                  className="rounded-full bg-charcoal px-4 py-1.5 text-sm text-ivory transition-colors hover:bg-accent disabled:opacity-60"
                >
                  {row.saving ? "Saving…" : "Save"}
                </button>

                {row.error && <span className="text-xs text-red-700">{row.error}</span>}
                {!row.error && row.savedAt && (
                  <span className="text-xs text-accent">Saved</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
