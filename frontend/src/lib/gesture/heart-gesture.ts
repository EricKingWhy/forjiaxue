export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

function distance(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

export function heartGestureScore(hands: LandmarkPoint[][]): number {
  if (hands.length < 2 || hands[0].length < 21 || hands[1].length < 21) return 0;
  const [left, right] = [...hands].sort((a, b) => a[0].x - b[0].x);
  const indexGap = distance(left[8], right[8]);
  const thumbGap = distance(left[4], right[4]);
  const wristGap = distance(left[0], right[0]);
  const indexY = (left[8].y + right[8].y) / 2;
  const thumbY = (left[4].y + right[4].y) / 2;
  if (indexGap > 0.18 || thumbGap > 0.18 || wristGap < 0.2 || thumbY - indexY < 0.08) {
    return 0;
  }
  const closeness = 1 - (indexGap + thumbGap) / 0.36;
  const symmetry = 1 - Math.min(1, Math.abs(left[0].y - right[0].y) / 0.2);
  return Math.max(0, Math.min(1, closeness * 0.85 + symmetry * 0.15));
}

export class HeartGestureMatcher {
  private consecutiveFrames = 0;
  private readonly requiredFrames: number;
  private readonly confidenceThreshold: number;

  constructor(
    requiredFrames = 8,
    confidenceThreshold = 0.72,
  ) {
    this.requiredFrames = requiredFrames;
    this.confidenceThreshold = confidenceThreshold;
  }

  update(score: number): { matched: boolean; progress: number } {
    this.consecutiveFrames = score >= this.confidenceThreshold
      ? this.consecutiveFrames + 1
      : 0;
    const progress = Math.min(1, this.consecutiveFrames / this.requiredFrames);
    return { matched: progress === 1, progress };
  }

  reset() {
    this.consecutiveFrames = 0;
  }
}
