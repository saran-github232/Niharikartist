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

    gsap.set(el, { transformPerspective: 800, transformStyle: "preserve-3d" });

    // A single tween per interaction, not separate quickTo() calls per
    // transform sub-property: GSAP's CSSPlugin merges rotateX/rotateY/scale
    // into one shared "transform" complex value under the hood, and
    // quickTo()'s fast resetTo() path can't find an individual PropTween for
    // just one of them when several quickTo instances race on the same
    // element — that's the "not eligible for reset" console warning. Plain
    // gsap.to() with overwrite:"auto" doesn't use that fast path, so it
    // interrupts cleanly instead of warning.
    let scale = 1;

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        rotateY: px * strength,
        rotateX: -py * strength,
        scale,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    }

    function onLeave() {
      scale = 1;
      gsap.to(el, { rotateX: 0, rotateY: 0, scale, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    }

    function onEnter() {
      scale = 1.02;
      gsap.to(el, { scale, duration: 0.5, ease: "power3.out", overwrite: "auto" });
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
