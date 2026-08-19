"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Cheap CSS-3D hover tilt (perspective rotateX/Y), no WebGL. Respects
// prefers-reduced-motion and does nothing on touch devices (no hover to tilt from).
export function useTilt3D<T extends HTMLElement>(strength = 10) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const quickX = gsap.quickTo(el, "rotateX", { duration: 0.5, ease: "power3.out" });
    const quickY = gsap.quickTo(el, "rotateY", { duration: 0.5, ease: "power3.out" });
    const quickScale = gsap.quickTo(el, "scale", { duration: 0.5, ease: "power3.out" });

    gsap.set(el, { transformPerspective: 800, transformStyle: "preserve-3d" });

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      quickY(px * strength);
      quickX(-py * strength);
    }

    function onLeave() {
      quickX(0);
      quickY(0);
      quickScale(1);
    }

    function onEnter() {
      quickScale(1.02);
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return ref;
}
