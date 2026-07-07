"use client";

import { gsap } from "gsap";
import { useEffect, type RefObject } from "react";
import type { ShaderMaterial } from "three";

interface NumberUniform {
  value: number;
}

/**
 * Controls the `scatterIntensity` uniform on a particle material.
 *
 * When `isPointerActive` is true the intensity jumps to 1 so the pointer
 * scatters nearby particles immediately. When it becomes false the value
 * tweens linearly back to 0 over 3 seconds, matching FR-011.
 */
export function useScatterReset(
  materialRef: RefObject<ShaderMaterial | null>,
  isPointerActive: boolean,
) {
  useEffect(() => {
    const uniform = materialRef.current?.uniforms.scatterIntensity as
      | NumberUniform
      | undefined;
    if (!uniform) return;

    if (isPointerActive) {
      gsap.killTweensOf(uniform);
      // Writing to a three.js IUniform.value is the documented API for
      // updating shader uniforms; the lint rule flags it because `uniform`
      // is derived from the ref, but this is an external-system mutation,
      // not a React state/props mutation.
      // eslint-disable-next-line react-hooks/immutability
      uniform.value = 1;
      return;
    }

    const tween = gsap.to(uniform, {
      value: 0,
      duration: 3,
      ease: "none",
    });
    return () => {
      tween.kill();
    };
  }, [isPointerActive, materialRef]);
}
