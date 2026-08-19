"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import imageLoader from "@/lib/image-loader";

// Adapted from an Originkit/Framer "Coverflow Carousel" code component: the
// active item is a big centered card, everything else is a thin flat slat
// positioned by its wrapped relative distance from the active index, so
// stepping is always a single-slat move and the loop is seamless. Framer's
// canvas-only plumbing (addPropertyControls, RenderTarget, defaultProps) is
// stripped — this is one fixed showcase, not a reusable design-panel widget.
// The rAF-driven single `pos` MotionValue (rather than React state) is kept
// as-is: it's what makes every card's position/size update without a
// re-render per frame.

export interface CoverflowItem {
  src: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

const SIZING = { activeWidth: 460, activeHeight: 340, restWidth: 150, restHeight: 210 };
const GAP = 22;
const RADIUS = 3; // 0 (square) .. 20 (fully rounded)
const RENDER_RANGE = 6;
const MOVE_DURATION = 0.4; // seconds per slot
const DWELL = 1.3; // seconds each card holds centered during autoplay

function relOf(index: number, pos: number, count: number): number {
  let rel = (((index - pos) % count) + count) % count;
  if (rel > count / 2) rel -= count;
  return rel;
}

function xForRel(rel: number, gap: number): number {
  const ar = Math.abs(rel);
  const c1 = SIZING.activeWidth / 2 + gap + SIZING.restWidth / 2;
  const pitch = SIZING.restWidth + gap;
  const mag = ar <= 1 ? ar * c1 : c1 + (ar - 1) * pitch;
  return (rel < 0 ? -1 : 1) * mag;
}

function blendForRel(rel: number): number {
  return Math.min(Math.abs(rel), 1);
}

function Card({
  item,
  index,
  pos,
  count,
  range,
  onSelect,
}: {
  item: CoverflowItem;
  index: number;
  pos: MotionValue<number>;
  count: number;
  range: number;
  onSelect: () => void;
}) {
  const proxiedSrc = useMemo(
    () => imageLoader({ src: item.src, width: SIZING.activeWidth * 2, quality: 75 }),
    [item.src]
  );

  const x = useTransform(pos, (p) => xForRel(relOf(index, p, count), GAP));
  const opacity = useTransform(pos, (p) => {
    const ar = Math.abs(relOf(index, p, count));
    return ar <= range ? 1 : ar >= range + 1 ? 0 : 1 - (ar - range);
  });
  const zIndex = useTransform(pos, (p) => Math.round(1000 - Math.abs(relOf(index, p, count)) * 100));
  const width = useTransform(pos, (p) => {
    const a = blendForRel(relOf(index, p, count));
    return SIZING.activeWidth + (SIZING.restWidth - SIZING.activeWidth) * a;
  });
  const height = useTransform(pos, (p) => {
    const a = blendForRel(relOf(index, p, count));
    return SIZING.activeHeight + (SIZING.restHeight - SIZING.activeHeight) * a;
  });
  const borderRadius = useTransform(pos, (p) => {
    const a = blendForRel(relOf(index, p, count));
    const w = SIZING.activeWidth + (SIZING.restWidth - SIZING.activeWidth) * a;
    const h = SIZING.activeHeight + (SIZING.restHeight - SIZING.activeHeight) * a;
    return (Math.max(0, Math.min(20, RADIUS)) / 20) * (Math.min(w, h) / 2);
  });

  return (
    <motion.div
      onClick={onSelect}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        x,
        zIndex,
        opacity,
        cursor: "pointer",
      }}
    >
      <motion.div
        style={{
          x: "-50%",
          y: "-50%",
          width,
          height,
          borderRadius,
          overflow: "hidden",
          background: "var(--color-sand)",
          boxShadow: "0 20px 55px rgba(22,19,15,0.35), 0 4px 14px rgba(22,19,15,0.2)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- size is CSS-driven by a MotionValue, next/image can't track that */}
        <img
          src={proxiedSrc}
          alt={item.title || ""}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

function ArrowButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const isLeft = side === "left";
  return (
    <button
      type="button"
      aria-label={isLeft ? "Previous artwork" : "Next artwork"}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute top-1/2 z-[2000] flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-charcoal/90 text-ivory shadow-lg transition-colors hover:bg-accent"
      style={isLeft ? { left: 4 } : { right: 4 }}
    >
      {isLeft ? "‹" : "›"}
    </button>
  );
}

export default function CoverflowCarousel({ items }: { items: CoverflowItem[] }) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const count = Math.max(1, items.length);
  const range = Math.max(1, Math.min(RENDER_RANGE, Math.floor(count / 2) - 1 || 1));

  const pos = useMotionValue(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number | null>(null);
  const autoplayingRef = useRef(true);
  const dwellAccRef = useRef(0);
  const reducedRef = useRef(prefersReducedMotion);
  useEffect(() => {
    reducedRef.current = prefersReducedMotion;
  }, [prefersReducedMotion]);

  const [activeIndex, setActiveIndex] = useState(0);

  // Self-recursive rAF loop: `tick` schedules another `tick`. Referencing the
  // useCallback-produced function from inside its own body (before the const
  // is assigned) trips the hooks linter, so the recursive call goes through
  // this ref instead — assigned in an effect below, never during render.
  const tickRef = useRef<(t: number) => void>(() => {});

  const tick = useCallback(
    (t: number) => {
      const last = lastTRef.current ?? t;
      const dt = Math.min((t - last) / 1000, 1 / 30);
      lastTRef.current = t;

      const cur = pos.get();
      const diff = targetRef.current - cur;
      const step = (1 / MOVE_DURATION) * dt;
      const arriving = reducedRef.current || Math.abs(diff) <= step;

      if (arriving) {
        pos.set(targetRef.current);
        if (autoplayingRef.current && !reducedRef.current) {
          dwellAccRef.current += dt;
          if (dwellAccRef.current >= DWELL) {
            dwellAccRef.current = 0;
            targetRef.current -= 1;
          }
          rafRef.current = requestAnimationFrame((t2) => tickRef.current(t2));
          return;
        }
        rafRef.current = null;
        lastTRef.current = null;
        return;
      }

      pos.set(cur + Math.sign(diff) * step);
      rafRef.current = requestAnimationFrame((t2) => tickRef.current(t2));
    },
    [pos]
  );

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const ensureRunning = useCallback(() => {
    if (rafRef.current == null) {
      lastTRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const goTo = useCallback(
    (index: number) => {
      autoplayingRef.current = false;
      const cur = targetRef.current;
      let d = index - cur;
      d = ((d % count) + count) % count;
      if (d > count / 2) d -= count;
      targetRef.current = cur + d;
      ensureRunning();
    },
    [ensureRunning, count]
  );

  const goNext = useCallback(() => {
    autoplayingRef.current = false;
    targetRef.current += 1;
    ensureRunning();
  }, [ensureRunning]);
  const goPrev = useCallback(() => {
    autoplayingRef.current = false;
    targetRef.current -= 1;
    ensureRunning();
  }, [ensureRunning]);

  useEffect(() => {
    if (count > 1) ensureRunning();
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub = pos.on("change", (p) => {
      const idx = ((Math.round(p) % count) + count) % count;
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    });
    return unsub;
  }, [pos, count]);

  const active = items[activeIndex];

  return (
    <div className="select-none">
      <div className="relative h-[320px] overflow-hidden sm:h-[380px]" style={{ touchAction: "pan-y" }}>
        <div className="absolute inset-0" style={{ isolation: "isolate" }}>
          {items.map((item, i) => (
            <Card
              key={item.src + i}
              item={item}
              index={i}
              pos={pos}
              count={count}
              range={range}
              onSelect={() => {
                if (i === activeIndex && item.href) {
                  router.push(item.href);
                } else {
                  goTo(i);
                }
              }}
            />
          ))}
        </div>
        {count > 1 && (
          <>
            <ArrowButton side="left" onClick={goPrev} />
            <ArrowButton side="right" onClick={goNext} />
          </>
        )}
      </div>
      {active && (active.title || active.subtitle) && (
        <div className="mt-6 text-center">
          {active.title && <p className="font-serif text-lg text-ink">{active.title}</p>}
          {active.subtitle && (
            <p className="text-xs uppercase tracking-wide text-stone">{active.subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
