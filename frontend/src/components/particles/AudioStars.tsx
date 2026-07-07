"use client";

import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { BufferGeometry, Points, PointsMaterial } from "three";

import { useAudioStore } from "@/stores";
import type { PerformanceTier } from "@/lib/performance";

export function AudioStars({ tier }: { tier: PerformanceTier }) {
  const ref = useRef<Points<BufferGeometry, PointsMaterial>>(null);
  const count = tier === "high" ? 420 : tier === "medium" ? 220 : 90;

  useFrame((_state, delta) => {
    if (!ref.current) return;
    const mid = useAudioStore.getState().mid;
    ref.current.rotation.z += delta * (0.012 + mid * 0.025);
    ref.current.material.opacity = 0.18 + mid * 0.34;
  });

  return (
    <Sparkles
      ref={ref}
      count={count}
      scale={[10, 6, 5]}
      size={tier === "low" ? 0.7 : 1}
      speed={0.08}
      opacity={0.2}
      color="#d9a6b3"
    />
  );
}
