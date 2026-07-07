import type { LandmarkPoint } from "./heart-gesture";

function distance(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

/**
 * Detects a "middle finger" gesture (竖中指) from a single hand.
 *
 * Anatomy (MediaPipe HandLandmarker indices):
 *   0  = wrist
 *   4  = thumb tip
 *   5  = index MCP (knuckle base)
 *   8  = index tip
 *   9  = middle MCP
 *   12 = middle tip
 *   16 = ring tip
 *   20 = pinky tip
 *
 * A middle-finger gesture is:
 *   - Middle finger fully extended (tip far from wrist, tip above MCP)
 *   - Index, ring, and pinky fingers curled (tips close to palm / below MCPs)
 *   - Thumb can be either extended or curled (ignored)
 */
export function middleFingerScore(hand: LandmarkPoint[]): number {
  if (hand.length < 21) return 0;

  const wrist = hand[0];
  const middleMcp = hand[9];
  const middleTip = hand[12];
  const indexTip = hand[8];
  const indexMcp = hand[5];
  const ringTip = hand[16];
  const ringMcp = hand[13];
  const pinkyTip = hand[20];
  const pinkyMcp = hand[17];

  // Palm size reference: wrist → middle MCP
  const palmSize = distance(wrist, middleMcp);
  if (palmSize < 0.02) return 0;

  // Middle finger extension: tip should be far from wrist (relative to palm)
  const middleExtension = distance(wrist, middleTip) / palmSize;
  if (middleExtension < 1.8) return 0; // middle finger must be clearly extended

  // Middle finger should point upward (tip.y < mcp.y in image coords, y grows downward)
  if (middleTip.y >= middleMcp.y) return 0;

  // Curled fingers: tips should be close to their MCPs (folded down)
  const indexCurl = distance(indexTip, indexMcp) / palmSize;
  const ringCurl = distance(ringTip, ringMcp) / palmSize;
  const pinkyCurl = distance(pinkyTip, pinkyMcp) / palmSize;

  // Curled fingers have small tip-to-MCP distance
  if (indexCurl > 0.9 || ringCurl > 0.9 || pinkyCurl > 0.9) return 0;

  // Score: how much middle stands out vs others
  const avgOtherCurl = (indexCurl + ringCurl + pinkyCurl) / 3;
  const contrast = Math.min(1, (middleExtension - 1.8) / 1.2);
  const curlQuality = Math.min(1, (0.9 - avgOtherCurl) / 0.6);

  return Math.max(0, Math.min(1, contrast * 0.6 + curlQuality * 0.4));
}

export class MiddleFingerMatcher {
  private consecutiveFrames = 0;
  private readonly requiredFrames: number;
  private readonly confidenceThreshold: number;

  constructor(
    requiredFrames = 8,
    confidenceThreshold = 0.65,
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
