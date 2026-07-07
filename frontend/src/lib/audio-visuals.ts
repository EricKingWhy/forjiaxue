function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function pointSizeFromBass(bass: number): number {
  return 1 + clamp01(bass) * 0.45;
}

export function scatterFromTreble(treble: number): number {
  return clamp01(treble) * 0.16;
}
