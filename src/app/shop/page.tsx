import type { Metadata } from "next";
import { getEffectiveShopArtworks } from "@/lib/shopOverrides";
import ArtworkCard from "@/components/ArtworkCard";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Shop",
  description: "Own a piece of art — original paintings and prints available to purchase.",
};

export default async function ShopPage() {
  const shopArtworks = await getEffectiveShopArtworks();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <SectionHeading
        eyebrow="Shop"
        title="Own a piece of art"
        description="Prints and original artworks available. Message on WhatsApp to check availability and arrange delivery."
      />
      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
        {shopArtworks.map((art, i) => (
          <ArtworkCard
            key={art.id}
            title={art.title}
            subtitle={art.available ? undefined : "Sold"}
            imageUrl={art.imageUrl}
            href={`/shop/${art.slug}`}
            price={art.price}
            available={art.available}
            priority={i < 4}
            cartArt={art}
          />
        ))}
      </div>
    </div>
  );
}
