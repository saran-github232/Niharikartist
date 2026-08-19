"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import FadeImage from "./FadeImage";

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
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(index);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function requestClose(target: () => void) {
    if (reducedMotion.current || !backdropRef.current || !panelRef.current) {
      target();
      return;
    }
    gsap.to(panelRef.current, { opacity: 0, scale: 0.92, duration: 0.2, ease: "power2.in" });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: target,
    });
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose(onClose);
      if (e.key === "ArrowRight") onNavigate((index + 1) % items.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length]);

  // 3D-flip transition on backdrop mount and on every index change.
  useEffect(() => {
    if (reducedMotion.current || !backdropRef.current || !panelRef.current) return;
    const isMount = prevIndexRef.current === index;
    const direction = index >= prevIndexRef.current ? 1 : -1;
    prevIndexRef.current = index;

    gsap.set(backdropRef.current, { transformPerspective: 1200 });

    if (isMount) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.9, rotateY: 10 },
        { opacity: 1, scale: 1, rotateY: 0, duration: 0.5, ease: "power3.out" }
      );
    } else {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, rotateY: 35 * direction, scale: 0.94 },
        { opacity: 1, rotateY: 0, scale: 1, duration: 0.45, ease: "power3.out" }
      );
    }
  }, [index]);

  if (!item) return null;

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[60] flex flex-col bg-ink/95 backdrop-blur-sm"
      onClick={() => requestClose(onClose)}
    >
      <button
        type="button"
        onClick={() => requestClose(onClose)}
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

      <div
        className="flex flex-1 items-center justify-center p-4 md:p-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={panelRef}
          className="relative h-full max-h-[75vh] w-full max-w-3xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          <FadeImage
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
