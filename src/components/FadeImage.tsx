"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export default function FadeImage({ className = "", onLoad, alt, src, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // The src can change without this component remounting (e.g. the lightbox
  // swapping images in place) — `loaded` must reset so the new image gets its
  // own shimmer/fade-in instead of silently showing the old frame at full
  // opacity while the network fetches the new one.
  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoaded(false);
  }

  return (
    <>
      <div
        aria-hidden
        className={`absolute inset-0 bg-sand transition-opacity duration-500 ${
          loaded ? "opacity-0" : "animate-pulse opacity-100"
        }`}
      />
      <Image
        {...props}
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </>
  );
}
