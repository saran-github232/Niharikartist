"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

export default function HeroIntro({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      Array.from(el.children),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.1 }
    );
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
