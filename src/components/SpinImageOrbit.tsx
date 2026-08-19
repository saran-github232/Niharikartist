"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import imageLoader from "@/lib/image-loader";

// Adapted from an Originkit/Framer "Spin Image" code component: images travel
// along a tilted 3D ellipse, depth-scaled and z-stacked so they pass in front
// of / behind one another as they orbit. Framer's prop-panel plumbing
// (COMPONENT_DEFAULTS, @framer* pragmas, preset-prop wrapper) is stripped —
// this is a single fixed hero treatment, not a reusable design-panel widget.

const DIRECTION = -1; // anticlockwise
const X_CURVE = 63; // deg
const Y_CURVE = -47; // deg
const REVS_PER_SEC = 3 * 0.05;
const ORBIT_WIDTH_PCT = 62;
const ELLIPSE_RATIO = 0.35;
const ROUNDED = 3; // 0 (square) .. 20 (circle)

export default function SpinImageOrbit({
  images,
  className = "",
}: {
  images: string[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ W: 0, H: 0 });
  const [orbitPhi, setOrbitPhi] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      const W = Math.round(rect.width);
      const H = Math.round(rect.height);
      if (W && H) setDims({ W, H });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const { W, H } = dims;
    if (!W || !H) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      setOrbitPhi(DIRECTION * 2 * Math.PI * REVS_PER_SEC * elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dims]);

  const { W, H } = dims;
  const n = images.length;

  // Image chips scale with the measured container instead of a fixed px
  // size, so the orbit reads well from a small phone hero to a wide desktop one.
  // Portrait aspect (not square): most of this artwork is a face-and-torso
  // portrait, and a square crop centered on the whole image was cutting faces
  // off. The extra height leaves room for a top-biased crop instead.
  const imgW = Math.max(64, Math.min(150, W * 0.14));
  const imgH = imgW * 1.25;
  const radius = (ROUNDED / 20) * (Math.min(imgW, imgH) / 2);
  const textureSize = Math.round(imgW * 2);

  const proxiedImages = useMemo(
    () => images.map((src) => imageLoader({ src, width: textureSize, quality: 70 })),
    [images, textureSize]
  );

  const a = ((Math.min(100, ORBIT_WIDTH_PCT) / 100) * W) / 2;
  const b = a * ELLIPSE_RATIO;
  const theta0 = Math.atan2(H, W);
  const cosT = Math.cos(theta0);
  const sinT = Math.sin(theta0);
  const cx = W / 2;
  const cy = H / 2;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", perspective: 1200 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateY(${X_CURVE}deg) rotateX(${-Y_CURVE}deg)`,
        }}
      >
        {W > 0 &&
          n > 0 &&
          proxiedImages.map((src, i) => {
            const phi = (i / n) * Math.PI * 2 + orbitPhi;
            const ex = a * Math.cos(phi);
            const ey = b * Math.sin(phi);
            const x = ex * cosT - ey * sinT;
            const y = ex * sinT + ey * cosT;
            const left = cx + x - imgW / 2;
            const top = cy + y - imgH / 2;
            const depth = (Math.cos(phi) + 1) / 2;
            const scale = 0.6 + 0.8 * depth;
            const zIndex = Math.round(y);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: imgW,
                  height: imgH,
                  transform: `rotateX(${Y_CURVE}deg) rotateY(${-X_CURVE}deg) scale(${scale})`,
                  zIndex,
                  borderRadius: radius,
                  overflow: "hidden",
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  // Biased toward the top: this artwork is mostly face-and-
                  // torso portraits, and a dead-center crop tends to land on
                  // the chest/neck instead of the face.
                  backgroundPosition: "center 15%",
                  backgroundRepeat: "no-repeat",
                  boxShadow: "0 8px 24px rgba(22,19,15,0.28), 0 2px 6px rgba(22,19,15,0.18)",
                  willChange: "left, top, transform",
                  pointerEvents: "none",
                }}
              />
            );
          })}
      </div>
    </div>
  );
}
