"use client";

import Link from "next/link";
import FadeImage from "./FadeImage";
import { useTilt3D } from "@/lib/useTilt3D";
import type { GalleryArtwork, GalleryCategory } from "@/data/gallery";

export default function CategoryCard({
  category,
  sample,
}: {
  category: GalleryCategory;
  sample: GalleryArtwork;
}) {
  const tiltRef = useTilt3D<HTMLDivElement>(10);

  return (
    <Link href={`/gallery?category=${encodeURIComponent(category)}`} className="group block">
      <div
        ref={tiltRef}
        className="relative aspect-[3/4] overflow-hidden will-change-transform"
      >
        <FadeImage
          src={sample.imageUrl}
          alt={category}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 font-serif text-lg text-ivory">
          {category}
        </span>
      </div>
    </Link>
  );
}
