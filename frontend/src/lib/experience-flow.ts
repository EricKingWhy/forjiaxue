export const PARTICLE_SOURCES = [
  "/particle-effect-1.html",
  "/particle-effect-2.html",
  "/particle-effect-3.html",
] as const;

export const PARTICLE_DURATIONS = [5_000, 6_000, 8_000] as const;

export type ParticleIndex = 0 | 1 | 2;
export type ExperienceScreen = "entry" | "christmas-tree" | "notes";

export function nextParticle(current: ParticleIndex): ParticleIndex {
  return ((current + 1) % PARTICLE_SOURCES.length) as ParticleIndex;
}

export function particleDuration(current: ParticleIndex): number {
  return PARTICLE_DURATIONS[current];
}

export function nextExperienceScreen(current: ExperienceScreen): ExperienceScreen {
  if (current === "entry") return "christmas-tree";
  if (current === "christmas-tree") return "notes";
  return "notes";
}
