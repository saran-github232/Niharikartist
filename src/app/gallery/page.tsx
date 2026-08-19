import type { Metadata } from "next";
import { galleryArtworks, galleryCategories, type GalleryCategory } from "@/data/gallery";
import GalleryGrid from "@/components/GalleryGrid";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore paintings, pencil portraits, caricature and live wedding art across mediums and years.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const initialCategory = galleryCategories.includes(category as GalleryCategory)
    ? (category as GalleryCategory)
    : undefined;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <SectionHeading
        eyebrow="Portfolio"
        title="Gallery"
        description="Explore my artwork across different styles and mediums."
      />
      <div className="mt-10">
        <GalleryGrid
          artworks={galleryArtworks}
          categories={galleryCategories}
          initialCategory={initialCategory}
        />
      </div>
    </div>
  );
}
