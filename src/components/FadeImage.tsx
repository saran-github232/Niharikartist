"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export default function FadeImage({ className = "", onLoad, alt, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

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
