"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ensureScrollTrigger } from "@/lib/scrollTrigger";

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    // Visible-by-default: GSAP only animates FROM a hidden state once JS is
    // confirmed running, so no-JS clients and crawlers always see full content.
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    ensureScrollTrigger();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 46, scale: 0.96, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.1,
          delay: delay / 1000,
          ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });

    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
