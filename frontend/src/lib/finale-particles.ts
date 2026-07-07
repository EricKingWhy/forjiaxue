export type FinaleStage = "gathering" | "rose" | "shattering" | "portrait";

export function finaleStageAt(elapsedMs: number): FinaleStage {
  if (elapsedMs < 2_200) return "gathering";
  if (elapsedMs < 5_000) return "rose";
  if (elapsedMs < 7_200) return "shattering";
  return "portrait";
}

/** A stylised rose head, stem and two leaves. Deterministic for smooth morphs. */
export function createRoseTargets(count: number): Float32Array {
  const result = new Float32Array(count * 3);
  const bloomCount = Math.floor(count * 0.76);
  for (let index = 0; index < count; index += 1) {
    let x: number;
    let y: number;
    let z: number;
    if (index < bloomCount) {
      const t = (index / bloomCount) * Math.PI * 12;
      const layer = 0.35 + 1.45 * (index / bloomCount);
      const ripple = 0.72 + 0.22 * Math.sin(t * 2.5);
      x = Math.cos(t) * layer * ripple;
      y = 1.45 + Math.sin(t) * layer * 0.72;
      z = Math.sin(t * 1.7) * 0.28 * (1 - index / bloomCount);
    } else {
      const p = (index - bloomCount) / Math.max(1, count - bloomCount - 1);
      y = 0.6 - p * 4.1;
      x = -0.2 + Math.sin(p * Math.PI * 2) * 0.11;
      z = 0;
      if (p > 0.32 && p < 0.55) x += Math.sin((p - 0.32) * Math.PI / 0.23) * 1.15;
      if (p > 0.55 && p < 0.76) x -= Math.sin((p - 0.55) * Math.PI / 0.21) * 0.9;
    }
    result.set([x, y, z], index * 3);
  }
  return result;
}

export function createScatterOrigins(count: number): Float32Array {
  const result = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const angle = index * 2.399963;
    const radius = 5.5 + ((index * 37) % 100) / 28;
    result.set([
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      (((index * 53) % 100) / 100 - 0.5) * 4,
    ], index * 3);
  }
  return result;
}
