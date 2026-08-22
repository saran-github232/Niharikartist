"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import FadeImage from "./FadeImage";
import AddToCartButton from "./AddToCartButton";
import { useTilt3D } from "@/lib/useTilt3D";
import { ensureScrollTrigger } from "@/lib/scrollTrigger";
import type { ShopArtwork } from "@/data/shop";

// This card renders in grids of a dozen+ at once (shop, gallery, related
// items). Next.js prefetches every in-viewport Link by default, which means
// a full grid fires a burst of detail-page prefetch requests immediately —
// competing with the grid's own images for bandwidth right when it matters
// most. prefetch={false} here; the detail page is a fast enough server
// render on click that losing prefetch isn't noticeable, but the images
// loading first is.
export default function ArtworkCard({
  title,
  subtitle,
  imageUrl,
  href,
  price,
  available,
  onClick,
  priority = false,
  cartArt,
}: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  href?: string;
  price?: number;
  available?: boolean;
  onClick?: () => void;
  priority?: boolean;
  /** When set, renders an AddToCartButton below the caption (shop context).
   *  Kept separate from the card's own Link/button so the cart button never
   *  ends up nested inside an anchor. */
  cartArt?: ShopArtwork;
}) {
  const tiltRef = useTilt3D<HTMLDivElement>(8);
  const revealRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const image = revealRef.current;
    const caption = captionRef.current;
    if (!image || !caption || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    ensureScrollTrigger();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: image, start: "top 90%", once: true },
      });
      tl.fromTo(
        image,
        { clipPath: "inset(0% 0% 100% 0%)", scale: 1.12 },
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.1, ease: "power4.out" }
      ).fromTo(
        caption,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );
    });

    return () => ctx.revert();
  }, []);

  const image = (
    <div
      ref={tiltRef}
      className="relative aspect-[4/5] overflow-hidden bg-sand will-change-transform"
    >
      <div ref={revealRef} className="absolute inset-0">
        <FadeImage
          src={imageUrl}
          alt={title}
          fill
          // Every grid this card renders in (shop, gallery, related items)
          // is 2 columns even on the smallest phones — the old 100vw
          // fallback told the browser to fetch a full-width image for what's
          // actually a half-width card, roughly doubling bytes downloaded
          // per thumbnail on mobile for no visual benefit.
          sizes="(min-width: 1024px) 33vw, 50vw"
          priority={priority}
          className="object-contain"
        />
      </div>
      {price !== undefined && !available && (
        <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs text-ivory">
          Sold
        </span>
      )}
    </div>
  );

  const captionText = (
    <div>
      <h3 className="font-serif text-base text-ink">{title}</h3>
      {subtitle && <p className="text-xs uppercase tracking-wide text-stone">{subtitle}</p>}
    </div>
  );

  // Shop context: the button needs to be a sibling of the link, not nested
  // inside it (a <button> inside an <a> is invalid HTML and double-fires).
  if (cartArt) {
    return (
      <div className="group text-left">
        <Link href={href ?? "#"} prefetch={false}>{image}</Link>
        <div ref={captionRef} className="pt-3">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <Link href={href ?? "#"} prefetch={false} className="flex items-center gap-2 hover:text-accent">
              <h3 className="font-serif text-base text-ink">{title}</h3>
              {price !== undefined && (
                <span className="shrink-0 text-sm text-accent">
                  {price > 0 ? `₹${price.toLocaleString("en-IN")}` : "Enquire"}
                </span>
              )}
            </Link>
            <AddToCartButton art={cartArt} size="sm" />
          </div>
          {subtitle && <p className="mt-1 text-xs uppercase tracking-wide text-stone">{subtitle}</p>}
        </div>
      </div>
    );
  }

  const body = (
    <>
      {image}
      <div ref={captionRef} className="flex items-baseline justify-between gap-2 pt-3">
        {captionText}
        {price !== undefined && (
          <span className="shrink-0 text-sm text-accent">
            {price > 0 ? `₹${price.toLocaleString("en-IN")}` : "Enquire"}
          </span>
        )}
      </div>
    </>
  );

  const className = "group block text-left";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }

  return (
    <Link href={href ?? "#"} prefetch={false} className={className}>
      {body}
    </Link>
  );
}
