"use client";

import Image from "next/image";
import { useEffect } from "react";

export interface LightboxItem {
  title: string;
  imageUrl: string;
  category?: string;
  year?: string;
}

export default function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const item = items[index];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % items.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, items.length, onClose, onNavigate]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[60] flex flex-col bg-ink/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/20"
      >
        ✕
      </button>

      <button
        type="button"
        aria-label="Previous image"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index - 1 + items.length) % items.length);
        }}
        className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/20 md:left-6"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index + 1) % items.length);
        }}
        className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/20 md:right-6"
      >
        ›
      </button>

      <div className="flex flex-1 items-center justify-center p-4 md:p-16" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-full max-h-[75vh] w-full max-w-3xl">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="pb-8 text-center text-ivory">
        <p className="font-serif text-lg">{item.title}</p>
        {(item.category || item.year) && (
          <p className="mt-1 text-xs uppercase tracking-wide text-ivory/60">
            {[item.category, item.year].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
