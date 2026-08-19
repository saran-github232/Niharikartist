import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { shopArtworks } from "@/data/shop";
import { siteConfig } from "@/data/siteConfig";
import ArtworkCard from "@/components/ArtworkCard";
import { whatsappLink, singleArtworkEnquiryMessage } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import FadeImage from "@/components/FadeImage";
import AddToCartButton from "@/components/AddToCartButton";

export function generateStaticParams() {
  return shopArtworks.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const art = shopArtworks.find((a) => a.slug === slug);
  if (!art) return {};
  return {
    title: art.title,
    description: art.description.slice(0, 155),
    openGraph: { images: [{ url: art.imageUrl }] },
  };
}

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const art = shopArtworks.find((a) => a.slug === slug);
  if (!art) notFound();

  const related = shopArtworks.filter((a) => a.slug !== art.slug).slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: art.title,
    description: art.description,
    image: art.imageUrl,
    offers: art.price
      ? {
          "@type": "Offer",
          price: art.price,
          priceCurrency: "INR",
          availability: art.available
            ? "https://schema.org/InStock"
            : "https://schema.org/SoldOut",
          url: `${siteConfig.url}/shop/${art.slug}`,
        }
      : undefined,
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <nav className="text-sm text-stone">
        <Link href="/shop" className="hover:text-accent">
          Shop
        </Link>{" "}
        / <span className="text-ink">{art.title}</span>
      </nav>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          <FadeImage
            src={art.imageUrl}
            alt={art.title}
            fill
            sizes="(min-width: 768px) 45vw, 90vw"
            priority
            className="object-cover"
          />
          {!art.available && (
            <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-xs text-ivory">
              Sold
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="font-serif text-3xl text-ink md:text-4xl">{art.title}</h1>
          <p className="mt-3 text-xl text-accent">
            {art.price > 0 ? `₹${art.price.toLocaleString("en-IN")}` : "Price on enquiry"}
          </p>
          <p className={`mt-1 text-sm ${art.available ? "text-stone" : "text-red-700"}`}>
            {art.available ? "Available" : "Sold"}
          </p>

          <div className="mt-6 whitespace-pre-line leading-relaxed text-stone">
            {art.description}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <AddToCartButton art={art} />
            <a
              href={whatsappLink(singleArtworkEnquiryMessage(art))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-stone underline decoration-accent underline-offset-4 hover:text-accent"
            >
              <WhatsAppIcon className="size-4" />
              Enquire Directly
            </a>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="font-serif text-2xl text-ink">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-4">
            {related.map((r) => (
              <ArtworkCard
                key={r.id}
                title={r.title}
                imageUrl={r.imageUrl}
                href={`/shop/${r.slug}`}
                price={r.price}
                available={r.available}
                cartArt={r}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
