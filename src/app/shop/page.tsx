import type { Metadata } from "next";
import { shopArtworks } from "@/data/shop";
import ArtworkCard from "@/components/ArtworkCard";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Shop",
  description: "Own a piece of art — original paintings and prints available to purchase.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <SectionHeading
        eyebrow="Shop"
        title="Own a piece of art"
        description="Prints and original artworks available. Message on WhatsApp to check availability and arrange delivery."
      />
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
        {shopArtworks.map((art, i) => (
          <Reveal key={art.id} delay={(i % 8) * 40}>
            <ArtworkCard
              title={art.title}
              subtitle={art.available ? undefined : "Sold"}
              imageUrl={art.imageUrl}
              href={`/shop/${art.slug}`}
              price={art.price}
              available={art.available}
              priority={i < 4}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
