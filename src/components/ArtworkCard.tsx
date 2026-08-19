"use client";

import Link from "next/link";
import FadeImage from "./FadeImage";
import { useTilt3D } from "@/lib/useTilt3D";

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

  const body = (
    <>
      <div
        ref={tiltRef}
        className="relative aspect-[4/5] overflow-hidden bg-sand will-change-transform"
      >
        <FadeImage
          src={imageUrl}
          alt={title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          className="object-cover"
        />
        {price !== undefined && !available && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs text-ivory">
            Sold
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2 pt-3">
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
