"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Image as DreiImage, Float } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import imageLoader from "@/lib/image-loader";

interface RingImage {
  id: string;
  url: string;
}

function ArtPlane({
  url,
  angle,
  radius,
}: {
  url: string;
  angle: number;
  radius: number;
}) {
  const position: [number, number, number] = [
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius,
  ];
  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.5}>
      <DreiImage
        url={url}
        position={position}
        rotation={[0, -angle + Math.PI / 2, 0]}
        scale={[1.5, 1.5 * 1.25]}
        transparent
        radius={0.05}
      />
    </Float>
  );
}

function Rig({ images }: { images: RingImage[] }) {
  const group = useRef<THREE.Group>(null);
  const radius = 3.4;

  useEffect(() => {
    const g = group.current;
    if (!g) return;
    gsap.fromTo(
      g.scale,
      { x: 0.001, y: 0.001, z: 0.001 },
      { x: 1, y: 1, z: 1, duration: 1.4, ease: "power3.out" }
    );
    gsap.fromTo(g.rotation, { y: -Math.PI / 3 }, { y: 0, duration: 1.6, ease: "power3.out" });
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.06;
    const targetX = -state.pointer.y * 0.15;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 4, delta);
  });

  return (
    <group ref={group}>
      {images.map((img, i) => (
        // Each plane suspends individually on its own texture load (drei's
        // Image/useTexture suspends) so pieces appear as they're ready
        // instead of the whole ring waiting on the slowest texture.
        <Suspense key={img.id} fallback={null}>
          <ArtPlane url={img.url} angle={(i / images.length) * Math.PI * 2} radius={radius} />
        </Suspense>
      ))}
    </group>
  );
}

function Scene(props: ThreeElements["group"] & { images: RingImage[] }) {
  const { images } = props;
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 2]} intensity={0.5} />
      <Rig images={images} />
    </>
  );
}

export default function GalleryRing({ images }: { images: { id: string; imageUrl: string }[] }) {
  const ringImages: RingImage[] = images.map((img) => ({
    id: img.id,
    url: imageLoader({ src: img.imageUrl, width: 400, quality: 70 }),
  }));

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.3, 7.2], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      style={{ pointerEvents: "auto" }}
    >
      <Scene images={ringImages} />
    </Canvas>
  );
}
