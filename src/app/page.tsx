import Link from "next/link";
import { artist } from "@/data/artist";
import { galleryArtworks, galleryCategories } from "@/data/gallery";
import CategoryCard from "@/components/CategoryCard";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import FadeImage from "@/components/FadeImage";
import HeroIntro from "@/components/HeroIntro";
import SpinImageOrbit from "@/components/SpinImageOrbit";
import CoverflowCarousel, { type CoverflowItem } from "@/components/CoverflowCarousel";
import NeonBorder from "@/components/originkit/ui/neon-border";
import { whatsappLink, generalEnquiryMessage } from "@/lib/whatsapp";

const featured: CoverflowItem[] = galleryArtworks.slice(0, 8).map((a) => ({
  src: a.imageUrl,
  title: a.title,
  subtitle: a.category,
  href: `/gallery#${a.slug}`,
}));
const heroRingImages = galleryArtworks.slice(0, 9).map((a) => a.imageUrl);
const philosophy = artist.bio
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  .pop();

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-end overflow-hidden">
        <FadeImage
          src={artist.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-transparent md:from-ink/50" />

        <div className="absolute inset-y-0 right-0 hidden w-[58%] md:block">
          <SpinImageOrbit images={heroRingImages} />
        </div>

        <HeroIntro className="relative mx-auto w-full max-w-6xl px-5 pb-16 md:px-8 md:pb-24">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-ivory/70">
            Ananthoja Niharika · Hyderabad, India
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-5xl leading-[1.05] text-ivory md:text-7xl">
            {artist.tagline}
          </h1>
          <p className="mt-5 max-w-lg text-ivory/80">{artist.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/gallery"
              className="rounded-full bg-ivory px-7 py-3 text-sm font-medium text-ink transition-colors hover:bg-accent hover:text-ivory"
            >
              Explore Artwork
            </Link>
            <a
              href={whatsappLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ivory/50 px-7 py-3 text-sm font-medium text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
            >
              Enquire on WhatsApp
            </a>
          </div>
        </HeroIntro>
      </section>

      {/* Featured artwork */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Selected Work"
            title="Featured artwork"
            description="A glimpse into recent paintings, portraits and commissions."
          />
        </Reveal>
        <div className="mt-10">
          <CoverflowCarousel items={featured} />
        </div>
        <Reveal>
          <div className="mt-12 text-center">
            <Link
              href="/gallery"
              className="text-sm font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent"
            >
              View the full gallery →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Artist introduction */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <FadeImage
                src={artist.profileImage}
                alt={artist.name}
                fill
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-0">
              <NeonBorder color="#D9954A" rounded={0} thickness={3} borderSize={45} glow={65} speed={6} />
            </div>
          </Reveal>
          <Reveal delay={100} className="flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              About the Artist
            </p>
            <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
              {artist.name}
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-stone">
              {artist.bio.split("\n")[0]}
            </p>
            <Link
              href="/about"
              className="mt-6 text-sm font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent"
            >
              Read the full story →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Collections by category */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Browse"
            title="Explore by medium"
            description="From graphite portraits to live wedding painting."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {galleryCategories.map((cat, i) => {
            const sample = galleryArtworks.find((a) => a.category === cat);
            if (!sample) return null;
            return (
              <Reveal key={cat} delay={i * 60}>
                <CategoryCard category={cat} sample={sample} />
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Philosophy */}
      {philosophy && (
        <section className="bg-charcoal py-24 text-center">
          <Reveal className="mx-auto max-w-2xl px-5">
            <p className="font-serif text-2xl italic leading-relaxed text-ivory md:text-3xl">
              “{philosophy}”
            </p>
          </Reveal>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-center md:px-8 md:py-28">
        <Reveal>
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Let&apos;s Create Together</h2>
          <p className="mx-auto mt-3 max-w-lg text-stone">
            Interested in commissioning a piece or collaborating on a project?
            I&apos;d love to hear from you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={whatsappLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-charcoal px-7 py-3 text-sm font-medium text-ivory transition-colors hover:bg-accent"
            >
              Enquire on WhatsApp
            </a>
            <Link
              href="/contact"
              className="rounded-full border border-stone/40 px-7 py-3 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Get in Touch
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
