"use client";

import { useMemo, useState } from "react";
import type { GalleryArtwork, GalleryCategory } from "@/data/gallery";
import ArtworkCard from "./ArtworkCard";
import Lightbox from "./Lightbox";

export default function GalleryGrid({
  artworks,
  categories,
  initialCategory,
}: {
  artworks: GalleryArtwork[];
  categories: GalleryCategory[];
  initialCategory?: GalleryCategory;
}) {
  const [filter, setFilter] = useState<"All" | GalleryCategory>(initialCategory ?? "All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (filter === "All" ? artworks : artworks.filter((a) => a.category === filter)),
    [artworks, filter]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["All", ...categories] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              filter === cat
                ? "border-charcoal bg-charcoal text-ivory"
                : "border-sand text-stone hover:border-accent hover:text-accent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((art, i) => (
          <ArtworkCard
            key={art.id}
            title={art.title}
            subtitle={`${art.category} · ${art.year}`}
            imageUrl={art.imageUrl}
            onClick={() => setLightboxIndex(i)}
            priority={i < 4}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-stone">No artwork in this category yet.</p>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          items={filtered.map((a) => ({
            title: a.title,
            imageUrl: a.imageUrl,
            category: a.category,
            year: a.year,
          }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
