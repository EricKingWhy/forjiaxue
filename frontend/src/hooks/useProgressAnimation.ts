"use client";

import { gsap } from "gsap";
import { useEffect, type RefObject } from "react";
import type { ShaderMaterial } from "three";

interface NumberUniform {
  value: number;
}

export function animateProgress(uniform: NumberUniform, duration = 6) {
  uniform.value = 0;
  return gsap.to(uniform, { value: 1, duration, ease: "power2.inOut" });
}

export function useProgressAnimation(
  materialRef: RefObject<ShaderMaterial | null>,
  enabled = true,
) {
  useEffect(() => {
    const uniform = materialRef.current?.uniforms.progress as NumberUniform | undefined;
    if (!enabled || !uniform) return;
    const tween = animateProgress(uniform);
    return () => {
      tween.kill();
    };
  }, [enabled, materialRef]);
}
