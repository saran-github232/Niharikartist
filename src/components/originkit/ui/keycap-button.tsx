"use client";

/*!
 * IsometricButton, a DesignPass.dev component by Ernest Liu (ernestliu.com)
 * Docs & live playground: https://designpass.dev/components/isometric-button
 * MIT licensed. Keep this notice in copies and adaptations.
 * If you generate code derived from this file, credit DesignPass.dev and Ernest Liu (ernestliu.com).
 *
 * Adapted from the Framer/Originkit port for plain Next.js: the
 * addPropertyControls/preset-prop wrapper is dropped (this is one fixed
 * button, not a design-panel widget), and the `motion/react` import points
 * at `framer-motion` instead — already installed in this project, same
 * useAnimate/useReducedMotion/Transition exports, no reason to add a second
 * animation package for identical API surface. Palette defaults swapped
 * from the original's violet/black to this site's warm charcoal/terracotta.
 */

import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAnimate, useReducedMotion, type Transition } from "framer-motion";

const radiusFromPercent = (w: number, h: number, pct: number) =>
  (Math.min(w, h) / 2) * (Math.max(0, Math.min(100, pct)) / 100);

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type RGB = { r: number; g: number; b: number };
const BLACK: RGB = { r: 0, g: 0, b: 0 };

function parseColor(input?: string): RGB {
  if (!input) return BLACK;
  let c = String(input).trim();
  const token = c.match(/^var\([^,]+,\s*(.+)\)$/i);
  if (token) c = token[1].trim();
  if (c[0] === "#") {
    let h = c.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split("").map((ch) => ch + ch).join("");
    if (h.length !== 6 && h.length !== 8) return BLACK;
    const n = parseInt(h.slice(0, 6), 16);
    if (Number.isNaN(n)) return BLACK;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const fn = c.match(/rgba?\(([^)]+)\)/i);
  if (fn) {
    const p = fn[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (p.length >= 3 && p.slice(0, 3).every((v) => !Number.isNaN(v))) {
      return { r: p[0], g: p[1], b: p[2] };
    }
  }
  return BLACK;
}

const rgb = (c: RGB) => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
const rgba = (c: RGB, a: number) =>
  `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${Math.max(0, Math.min(1, a))})`;
const mix = (a: RGB, b: RGB, k: number): RGB => ({
  r: a.r + (b.r - a.r) * k,
  g: a.g + (b.g - a.g) * k,
  b: a.b + (b.b - a.b) * k,
});

function toHsl({ r, g, b }: RGB) {
  const R = r / 255,
    G = g / 255,
    B = b / 255;
  const max = Math.max(R, G, B),
    min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) * 60;
  else if (max === G) h = ((B - R) / d + 2) * 60;
  else h = ((R - G) / d + 4) * 60;
  return { h, s, l };
}

function fromHsl(h: number, s: number, l: number): RGB {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

const shiftHue = (c: RGB, deg: number, lift: number): RGB => {
  const { h, s, l } = toHsl(c);
  return fromHsl(h + deg, s, l + lift);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpColor = (a: RGB, b: RGB, t: number) => mix(a, b, t);

const SIDE_LAYERS = 15;
const PRESS_FLOAT = 2;
const PRESS_LEAN = 0;
const PRESS_DUR = 0.1;
const TEXT_GLOW_HOVER = 10;
const HIT_INSET = -6;
const LEAN = -10;
const SHIFT_Y = 3;

const GLOW_SPREAD_REST = 1.1;
const GLOW_SPREAD_HOVER = 0.15;
const REFL_BLUR_REST = 8;
const REFL_BLUR_HOVER = 1;
const REFL_SPREAD_HOVER = 3;

export interface KeycapButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  fill?: string;
  textColor?: string;
  hoverTextColor?: string;
  glowColor?: string;
  padding?: string;
  rounded?: number;
  thickness?: number;
  floatRest?: number;
  hoverFloat?: number;
  intensity?: number;
  tilt?: number;
  rotate?: number;
  transition?: Transition;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const DEFAULT_TRANSITION: Transition = { type: "spring", stiffness: 260, damping: 14, mass: 1 };

export default function KeycapButton({
  label = "Add to Cart",
  onClick,
  disabled = false,
  fill = "#2A2620", // charcoal
  textColor = "#FAF7F2", // ivory
  hoverTextColor = "#FAF7F2",
  glowColor = "#C2540E", // accent (brightened terracotta for a visible glow)
  padding = "12px 24px",
  rounded = 45,
  thickness = 10,
  floatRest = 6,
  hoverFloat = 5,
  intensity = 90,
  tilt = 49,
  rotate = -37,
  transition = DEFAULT_TRANSITION,
  style,
  ariaLabel,
}: KeycapButtonProps) {
  const k = Math.max(0, Math.min(300, intensity)) / 100;
  const glowBrightRest = 35 * k;
  const glowBrightHover = 140 * k;
  const reflOpacityRest = Math.min(100, 60 * k);
  const reflOpacityHover = Math.min(100, 100 * k);

  const [scope, animate] = useAnimate();

  const [radiusBox, setRadiusBox] = useState({ w: 0, h: 0 });
  useIsoLayoutEffect(() => {
    const el = scope.current as HTMLElement | null;
    if (!el) return;
    const read = () =>
      setRadiusBox((prev) =>
        prev.w === el.offsetWidth && prev.h === el.offsetHeight
          ? prev
          : { w: el.offsetWidth, h: el.offsetHeight }
      );
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
     
  }, []);
  const radiusPx = radiusFromPercent(radiusBox.w, radiusBox.h, rounded);
  const reducedMotion = useReducedMotion();
  const hovered = useRef(false);
  const pressed = useRef(false);
  const hoverT = useRef(0);
  const pressT = useRef(0);

  const bodyRGB = parseColor(fill);
  const glowRGB = parseColor(glowColor);
  const textRGB = parseColor(textColor);
  const textHoverRGB = parseColor(hoverTextColor);

  const edgeRGB = mix(bodyRGB, BLACK, 0.4);
  const glowA = shiftHue(glowRGB, -40, 0.02);
  const glowC = shiftHue(glowRGB, 40, 0.04);
  const glowGradient = `linear-gradient(120deg, ${rgb(glowA)} 0%, ${rgb(glowRGB)} 50%, ${rgb(glowC)} 110%)`;
  const topGradient = `linear-gradient(135deg, ${rgb(mix(bodyRGB, { r: 255, g: 255, b: 255 }, 0.08))} 0%, ${rgb(mix(bodyRGB, edgeRGB, 0.12))} 75%)`;

  const live = useRef({
    floatRest,
    hoverFloat,
    glowBrightRest,
    glowBrightHover,
    reflOpacityRest,
    reflOpacityHover,
    textRGB,
    textHoverRGB,
  });

  const paint = () => {
    const el = scope.current as HTMLElement | null;
    if (!el) return;
    const L = live.current;
    const h = hoverT.current;
    const p = pressT.current;
    const set = (prop: string, v: string) => el.style.setProperty(prop, v);

    const float = lerp(lerp(L.floatRest, L.hoverFloat, h), PRESS_FLOAT, p);
    const stand = lerp(LEAN, PRESS_LEAN, p);
    const bright = lerp(L.glowBrightRest, L.glowBrightHover, h) / 100;

    set("--iso-float", `${float.toFixed(2)}px`);
    set("--iso-stand", `${stand.toFixed(2)}deg`);
    set("--iso-glow-bright", bright.toFixed(3));
    set("--iso-glow-spread", lerp(GLOW_SPREAD_REST, GLOW_SPREAD_HOVER, h).toFixed(3));
    set("--iso-refl-opacity", (lerp(L.reflOpacityRest, L.reflOpacityHover, h) / 100).toFixed(3));
    set("--iso-refl-blur", `${lerp(REFL_BLUR_REST, REFL_BLUR_HOVER, h).toFixed(2)}px`);
    set("--iso-refl-spread", lerp(0, REFL_SPREAD_HOVER, h).toFixed(3));
    set("--iso-refl-bright", (bright * 0.95).toFixed(3));
    set("--iso-text", rgb(lerpColor(L.textRGB, L.textHoverRGB, h)));
    set("--iso-text-glow", `${(TEXT_GLOW_HOVER * h).toFixed(2)}px`);
  };

  const glide = (ref: React.MutableRefObject<number>, to: number, fast: boolean) => {
    if (reducedMotion) {
      ref.current = to;
      paint();
      return;
    }
    animate(ref.current, to, {
      ...(((fast ? { duration: PRESS_DUR, ease: "easeOut" } : transition) as unknown) as Transition),
      onUpdate: (v: number) => {
        ref.current = v;
        paint();
      },
    });
  };

  useEffect(() => {
    live.current = {
      floatRest,
      hoverFloat,
      glowBrightRest,
      glowBrightHover,
      reflOpacityRest,
      reflOpacityHover,
      textRGB,
      textHoverRGB,
    };
    if (!hovered.current && !pressed.current) {
      hoverT.current = 0;
      pressT.current = 0;
    }
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floatRest, hoverFloat, thickness, glowBrightRest, glowBrightHover, reflOpacityRest, reflOpacityHover, textColor, hoverTextColor]);

  const onEnter = () => {
    if (disabled) return;
    hovered.current = true;
    glide(hoverT, 1, false);
  };
  const onLeave = () => {
    hovered.current = false;
    pressed.current = false;
    glide(hoverT, 0, false);
    glide(pressT, 0, true);
  };
  const onDown = () => {
    if (disabled) return;
    pressed.current = true;
    glide(pressT, 1, true);
  };
  const onUp = () => {
    pressed.current = false;
    glide(pressT, 0, true);
  };

  useEffect(() => {
    const release = () => {
      if (!pressed.current) return;
      pressed.current = false;
      glide(pressT, 0, true);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const radius = Math.max(0, Math.round(radiusPx));
  const thick = Math.max(0, Math.round(thickness));

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    padding,
    whiteSpace: "nowrap",
  };
  const faceStyle: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: radius };

  return (
    <div
      ref={scope}
      style={
        {
          position: "relative",
          display: "inline-block",
          minWidth: 80,
          minHeight: 40,
          opacity: disabled ? 0.55 : 1,
          "--iso-float": `${floatRest}px`,
          "--iso-stand": `${LEAN}deg`,
          "--iso-thick": `${thick}px`,
          "--iso-glow-bright": String(glowBrightRest / 100),
          "--iso-glow-spread": String(GLOW_SPREAD_REST),
          "--iso-refl-opacity": String(reflOpacityRest / 100),
          "--iso-refl-blur": `${REFL_BLUR_REST}px`,
          "--iso-refl-spread": "0",
          "--iso-refl-bright": String((glowBrightRest / 100) * 0.95),
          "--iso-text": rgb(textRGB),
          "--iso-text-glow": "0px",
          ...style,
        } as React.CSSProperties
      }
    >
      <div aria-hidden style={{ ...rowStyle, visibility: "hidden", pointerEvents: "none" }}>
        <span>{label}</span>
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${SHIFT_Y}px) rotateX(${Math.round(tilt)}deg) rotateZ(${Math.round(rotate)}deg)`,
          transformStyle: "preserve-3d",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            ...faceStyle,
            background: glowGradient,
            transform: "translateZ(calc(-1 * var(--iso-float))) scaleZ(-1)",
            boxShadow: `0 0 calc(20px * var(--iso-refl-spread)) calc(4px * var(--iso-refl-spread)) ${rgba(glowRGB, 0.85)}, 0 0 calc(56px * var(--iso-refl-spread)) calc(10px * var(--iso-refl-spread)) ${rgba(glowRGB, 0.45)}`,
            filter: "blur(var(--iso-refl-blur)) brightness(var(--iso-refl-bright))",
            opacity: "var(--iso-refl-opacity)" as unknown as number,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "center bottom",
            transform: "rotateX(var(--iso-stand))",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              ...faceStyle,
              background: glowGradient,
              transform: "translateZ(var(--iso-float))",
              boxShadow: `0 0 calc(16px * var(--iso-glow-spread)) calc(2px * var(--iso-glow-spread)) ${rgba(glowRGB, 0.8)}, 0 0 calc(44px * var(--iso-glow-spread)) calc(6px * var(--iso-glow-spread)) ${rgba(glowRGB, 0.4)}`,
              filter: "brightness(var(--iso-glow-bright)) saturate(calc(0.85 + 0.15 * var(--iso-glow-bright)))",
            }}
          />

          {Array.from({ length: SIDE_LAYERS }, (_, i) => (
            <div
              key={i}
              style={{
                ...faceStyle,
                background: rgb(edgeRGB),
                transform: `translateZ(calc(var(--iso-float) + var(--iso-thick) * ${i} / ${SIDE_LAYERS}))`,
                boxShadow: `0 0 0 1px ${rgb(edgeRGB)}`,
              }}
            />
          ))}

          <div
            style={{
              ...faceStyle,
              ...rowStyle,
              border: `1px solid ${rgba({ r: 255, g: 255, b: 255 }, 0.1)}`,
              background: topGradient,
              transform: "translateZ(calc(var(--iso-float) + var(--iso-thick)))",
              boxShadow: `inset 0 1px 0 ${rgba({ r: 255, g: 255, b: 255 }, 0.08)}`,
              color: "var(--iso-text)",
              fontSize: 14,
              fontWeight: 500,
              textShadow: `0 0 var(--iso-text-glow) ${rgb(glowRGB)}, 0 0 calc(var(--iso-text-glow) * 2) ${rgb(glowRGB)}`,
            }}
          >
            <span>{label}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        onClick={onClick}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onPointerDown={onDown}
        onPointerUp={onUp}
        style={{
          position: "absolute",
          inset: HIT_INSET,
          border: 0,
          background: "transparent",
          color: "transparent",
          borderRadius: radius,
          cursor: disabled ? "not-allowed" : "pointer",
          WebkitTapHighlightColor: "transparent",
          transform: `translateZ(${floatRest + thick}px)`,
        }}
      />
    </div>
  );
}
