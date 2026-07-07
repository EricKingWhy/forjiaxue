"use client";

import { useEffect, useState } from "react";
import { tierForFps, type PerformanceTier } from "@/lib/performance";

export interface PerformanceState {
  tier: PerformanceTier;
  isDetecting: boolean;
}

const MOBILE_UA = /Mobi|Android|iPhone|iPad/i;

function detectTier(): PerformanceTier {
  if (typeof navigator === "undefined") return "medium";
  const isMobile = MOBILE_UA.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency ?? 0;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory ?? 0;

  if (!isMobile && cores >= 8) return "high";
  if ((!isMobile && cores >= 4) || (isMobile && cores >= 6)) return "medium";
  if (cores === 0 && memory >= 8) return "medium";
  return "low";
}

/**
 * Detects a device performance tier (`high`/`medium`/`low`) using
 * `navigator.hardwareConcurrency`, `navigator.deviceMemory` and a mobile UA
 * check. SSR-safe: returns `medium` until the client re-runs detection.
 *
 * The optional `defaultTier` (typically from `configStore.particle_tier_default`)
 * is only used as a fallback when client-side signals are unavailable.
 */
export function usePerformance(
  defaultTier: PerformanceTier = "medium",
): PerformanceState {
  const [state, setState] = useState<PerformanceState>({
    tier: "medium",
    isDetecting: true,
  });

  useEffect(() => {
    let tier = detectTier();
    if (tier === "medium" && defaultTier !== "medium") {
      tier = defaultTier;
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ tier, isDetecting: true });

    let frames = 0;
    const startedAt = performance.now();
    let frameId = 0;
    const sample = (now: number) => {
      frames += 1;
      const elapsed = now - startedAt;
      if (elapsed >= 1500) {
        if (!cancelled) {
          const fps = (frames * 1000) / elapsed;
          setState({ tier: tierForFps(tier, fps), isDetecting: false });
        }
        return;
      }
      frameId = requestAnimationFrame(sample);
    };
    frameId = requestAnimationFrame(sample);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [defaultTier]);

  return state;
}
