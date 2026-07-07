export type PerformanceTier = "high" | "medium" | "low";

export const PARTICLE_TIER_COUNTS = {
  high: 60000,
  medium: 30000,
  low: 12000,
} as const;

export function getParticleCount(tier: PerformanceTier): number {
  return PARTICLE_TIER_COUNTS[tier];
}

/**
 * Bloom is disabled on low-tier devices to keep the frame rate usable.
 * Callers may also pass an explicit `bloomEnabled` flag from the config
 * store to override the tier-based decision.
 */
export function shouldEnableBloom(
  tier: PerformanceTier,
  bloomEnabled?: boolean,
): boolean {
  if (bloomEnabled === false) return false;
  return tier !== "low";
}

export function tierForFps(
  currentTier: PerformanceTier,
  fps: number,
): PerformanceTier {
  if (fps < 30) return "low";
  if (fps < 50 && currentTier === "high") return "medium";
  return currentTier;
}
