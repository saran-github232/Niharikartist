"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ShopArtwork } from "@/data/shop";
import type { PublicAdmin } from "@/lib/adminStore";
import { fileToOptimizedDataUrl } from "@/lib/imageResize";

const MAX_ADMINS = 3;

type RowState = { price: string; available: boolean; saving: boolean; savedAt: number | null; error: string | null };

function rowsFrom(items: ShopArtwork[]): Record<string, RowState> {
  return Object.fromEntries(
    items.map((a) => [
      a.slug,
      { price: String(a.price), available: a.available, saving: false, savedAt: null, error: null },
    ])
  );
}

function isDirty(row: RowState, art: ShopArtwork): boolean {
  return Number(row.price) !== art.price || row.available !== art.available;
}

export default function AdminDashboard({
  initialItems,
  admins,
  currentAdmin,
}: {
  initialItems: ShopArtwork[];
  admins: PublicAdmin[];
  currentAdmin: PublicAdmin;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [rows, setRows] = useState<Record<string, RowState>>(() => rowsFrom(initialItems));
  const [savingAll, setSavingAll] = useState(false);
  const [saveAllError, setSaveAllError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const dirtySlugs = items.filter((art) => rows[art.slug] && isDirty(rows[art.slug], art));

  // Stats reflect the in-progress row edits (not just what's been Saved), so
  // typing a new price or flipping Available updates these live.
  const effective = items.map((art) => {
    const row = rows[art.slug];
    const price = row ? Number(row.price) : art.price;
    return { available: row ? row.available : art.available, price: Number.isFinite(price) ? price : art.price };
  });
  const availableCount = effective.filter((a) => a.available).length;
  const soldCount = effective.length - availableCount;
  const inventoryValue = effective.filter((a) => a.available).reduce((sum, a) => sum + a.price, 0);
  const pendingCount = admins.filter((a) => a.status === "pending").length;

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

  async function saveAll() {
    if (dirtySlugs.length === 0) return;
    setSavingAll(true);
    setSaveAllError(null);

    const payload = dirtySlugs.map((art) => ({
      slug: art.slug,
      price: Number(rows[art.slug].price),
      available: rows[art.slug].available,
    }));

    const invalid = payload.find((p) => !Number.isFinite(p.price) || p.price < 0);
    if (invalid) {
      setSaveAllError(`${invalid.slug}: price must be a non-negative number.`);
      setSavingAll(false);
      return;
    }

    const res = await fetch("/api/admin/shop", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: payload }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setSaveAllError(data?.error ?? "Save all failed.");
      setSavingAll(false);
      return;
    }

    const now = Date.now();
    setRows((prev) => {
      const next = { ...prev };
      for (const p of payload) next[p.slug] = { ...next[p.slug], savedAt: now };
      return next;
    });
    setSavingAll(false);
    router.refresh();
  }

  async function deleteProduct(slug: string, title: string) {
    if (!window.confirm(`Remove "${title}" from the shop? This can't be undone.`)) return;
    setDeletingSlug(slug);
    const res = await fetch("/api/admin/shop", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((a) => a.slug !== slug));
      setRows((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
      router.refresh();
    }
    setDeletingSlug(null);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">Admin</h1>
          <p className="mt-1 text-sm text-stone">
            Signed in as {currentAdmin.name} ({currentAdmin.email})
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-stone px-4 py-2 text-sm text-ink hover:border-accent hover:text-accent"
        >
          Log out
        </button>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 text-center sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-sand bg-ivory px-3 py-4">
          <dt className="text-xs text-stone">Products</dt>
          <dd className="mt-1 font-serif text-xl text-ink">{items.length}</dd>
        </div>
        <div className="rounded-lg border border-sand bg-ivory px-3 py-4">
          <dt className="text-xs text-stone">Available</dt>
          <dd className="mt-1 font-serif text-xl text-ink">{availableCount}</dd>
        </div>
        <div className="rounded-lg border border-sand bg-ivory px-3 py-4">
          <dt className="text-xs text-stone">Sold</dt>
          <dd className="mt-1 font-serif text-xl text-ink">{soldCount}</dd>
        </div>
        <div className="rounded-lg border border-sand bg-ivory px-3 py-4">
          <dt className="text-xs text-stone">Inventory value</dt>
          <dd className="mt-1 font-serif text-xl text-ink">₹{inventoryValue.toLocaleString("en-IN")}</dd>
        </div>
        <Link
          href="/admin/team"
          className="relative rounded-lg border border-accent/40 bg-ivory px-3 py-4 text-center shadow-sm transition-colors hover:border-accent hover:bg-accent/5"
        >
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-ivory">
              {pendingCount}
            </span>
          )}
          <dt className="text-xs text-stone">Admin seats</dt>
          <dd className="mt-1 font-serif text-xl text-ink">
            {admins.length}/{MAX_ADMINS}
          </dd>
          <span className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-medium text-accent">
            {pendingCount > 0 ? `${pendingCount} pending` : "Manage"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} className="size-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </dl>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-ink">Shop</h2>
            <p className="mt-1 text-sm text-stone">
              Update price and availability. Changes appear on the public site immediately.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveAllError && <span className="text-xs text-red-700">{saveAllError}</span>}
            <button
              type="button"
              onClick={saveAll}
              disabled={savingAll || dirtySlugs.length === 0}
              className="rounded-full bg-accent px-5 py-2 text-sm text-ivory transition-colors hover:opacity-90 disabled:opacity-40"
            >
              {savingAll ? "Saving all…" : `Save all${dirtySlugs.length ? ` (${dirtySlugs.length})` : ""}`}
            </button>
          </div>
        </div>

        <ul className="mt-6 divide-y divide-sand/60">
          {items.map((art) => {
            const row = rows[art.slug];
            if (!row) return null;
            return (
              <li key={art.slug} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-sand">
                  <Image src={art.imageUrl} alt={art.title} fill sizes="64px" className="object-cover" />
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

                  <button
                    type="button"
                    onClick={() => deleteProduct(art.slug, art.title)}
                    disabled={deletingSlug === art.slug}
                    aria-label={`Remove ${art.title}`}
                    title="Remove product"
                    className="flex size-8 items-center justify-center rounded-full border border-red-700 text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingSlug === art.slug ? (
                      <span className="text-xs">…</span>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-4">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-8 0 1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13"
                        />
                      </svg>
                    )}
                  </button>

                  {row.error && <span className="text-xs text-red-700">{row.error}</span>}
                  {!row.error && row.savedAt && <span className="text-xs text-accent">Saved</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Add product</h2>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-full border border-stone px-4 py-1.5 text-sm text-ink hover:border-accent hover:text-accent"
          >
            {showAddForm ? "Cancel" : "New product"}
          </button>
        </div>
        {showAddForm && (
          <AddProductForm
            onAdded={(artwork) => {
              setItems((prev) => [...prev, artwork]);
              setRows((prev) => ({
                ...prev,
                [artwork.slug]: {
                  price: String(artwork.price),
                  available: artwork.available,
                  saving: false,
                  savedAt: null,
                  error: null,
                },
              }));
              setShowAddForm(false);
              router.refresh();
            }}
          />
        )}
      </section>
    </div>
  );
}

function AddProductForm({ onAdded }: { onAdded: (artwork: ShopArtwork) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setProcessingImage(true);
    try {
      setImageUrl(await fileToOptimizedDataUrl(file));
    } catch {
      setError("Couldn't read that image. Try a different file.");
      setImageUrl("");
    } finally {
      setProcessingImage(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shop/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price: Number(price), available, imageUrl }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Could not add product.");
        return;
      }
      onAdded(data.artwork as ShopArtwork);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-sand bg-ivory p-4">
      <div>
        <label htmlFor="new-title" className="text-sm text-stone">
          Title
        </label>
        <input
          id="new-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-sand bg-paper px-3 py-2 text-ink focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="new-description" className="text-sm text-stone">
          Description
        </label>
        <textarea
          id="new-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-sand bg-paper px-3 py-2 text-ink focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="new-image" className="text-sm text-stone">
          Photo
        </label>
        <div className="mt-1 flex items-start gap-4">
          <div className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-sm bg-sand">
            {imageUrl && (
              // Plain <img>, not next/image: this is a local data-URL preview,
              // never fetched over the network, so optimization doesn't apply.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="size-full object-contain" />
            )}
          </div>
          <div className="flex-1">
            <input
              id="new-image"
              type="file"
              accept="image/*"
              required={!imageUrl}
              onChange={handleFile}
              className="block w-full text-sm text-stone file:mr-3 file:rounded-full file:border-0 file:bg-charcoal file:px-4 file:py-2 file:text-sm file:text-ivory hover:file:bg-accent"
            />
            <p className="mt-2 text-xs text-stone">
              {processingImage
                ? "Processing…"
                : "Uploaded from your device — resized automatically, and the preview shows exactly how it'll fit the shop card frame."}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5 text-sm text-stone">
          ₹
          <input
            type="number"
            min={0}
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-28 rounded-md border border-sand bg-paper px-2 py-1.5 text-ink focus:border-accent"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-stone">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="size-4 accent-accent"
          />
          Available
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || processingImage || !imageUrl}
        className="rounded-full bg-charcoal px-5 py-2 text-sm text-ivory transition-colors hover:bg-accent disabled:opacity-60"
      >
        {loading ? "Adding…" : "Add product"}
      </button>
    </form>
  );
}
