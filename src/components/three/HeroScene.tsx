"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const GalleryRing = dynamic(() => import("./GalleryRing"), { ssr: false });

// Memoized + explicitly released: `getSnapshot` below runs on every render
// (useSyncExternalStore re-checks it for changes), and a naive feature-detect
// that creates a fresh WebGL context each call leaks contexts fast enough to
// hit the browser's live-context limit and knock out the real canvas.
let cachedHasWebGL: boolean | null = null;
function hasWebGL() {
  if (cachedHasWebGL !== null) return cachedHasWebGL;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    cachedHasWebGL = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cachedHasWebGL = false;
  }
  return cachedHasWebGL;
}

const noopSubscribe = () => () => {};

// Skip entirely for reduced-motion, no-WebGL, and small screens (touch
// devices don't benefit from the mouse-parallax, and it's meaningful GPU/
// battery cost for a decorative layer) — the static hero photo underneath
// is already a complete, real hero on its own.
function getSnapshot() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wideEnough = window.matchMedia("(min-width: 768px)").matches;
  return !reduced && wideEnough && hasWebGL();
}

function getServerSnapshot() {
  return false;
}

export default function HeroScene({
  images,
}: {
  images: { id: string; imageUrl: string }[];
}) {
  const enabled = useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot);

  if (!enabled) return null;

  return (
    <div className="pointer-events-auto absolute inset-y-0 right-0 hidden w-[55%] md:block">
      <GalleryRing images={images} />
    </div>
  );
}
