"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import FadeImage from "./FadeImage";
import { useTilt3D } from "@/lib/useTilt3D";
import { ensureScrollTrigger } from "@/lib/scrollTrigger";

export default function ArtworkCard({
  title,
  subtitle,
  imageUrl,
  href,
  price,
  available,
  onClick,
  priority = false,
}: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  href?: string;
  price?: number;
  available?: boolean;
  onClick?: () => void;
  priority?: boolean;
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

  const body = (
    <>
      <div
        ref={tiltRef}
        className="relative aspect-[4/5] overflow-hidden bg-sand will-change-transform"
      >
        <div ref={revealRef} className="absolute inset-0">
          <FadeImage
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover"
          />
        </div>
        {price !== undefined && !available && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs text-ivory">
            Sold
          </span>
        )}
      </div>
      <div ref={captionRef} className="flex items-baseline justify-between gap-2 pt-3">
        <div>
          <h3 className="font-serif text-base text-ink">{title}</h3>
          {subtitle && <p className="text-xs uppercase tracking-wide text-stone">{subtitle}</p>}
        </div>
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
    <Link href={href ?? "#"} className={className}>
      {body}
    </Link>
  );
}
