import assert from "node:assert/strict";
import test from "node:test";

import { HeartGestureMatcher, heartGestureScore } from "./heart-gesture.ts";

function hand(index, thumb, wrist) {
  const points = Array.from({ length: 21 }, () => ({ x: wrist.x, y: wrist.y, z: 0 }));
  points[0] = wrist;
  points[4] = thumb;
  points[8] = index;
  points[9] = { x: wrist.x, y: wrist.y - 0.12, z: 0 };
  return points;
}

test("scores a symmetric two-hand heart pose highly", () => {
  const left = hand({ x: 0.49, y: 0.38, z: 0 }, { x: 0.48, y: 0.56, z: 0 }, { x: 0.3, y: 0.7, z: 0 });
  const right = hand({ x: 0.51, y: 0.38, z: 0 }, { x: 0.52, y: 0.56, z: 0 }, { x: 0.7, y: 0.7, z: 0 });
  assert.ok(heartGestureScore([left, right]) > 0.8);
});

test("requires consecutive confident frames before matching", () => {
  const matcher = new HeartGestureMatcher(3, 0.7);
  assert.deepEqual(matcher.update(0.8), { matched: false, progress: 1 / 3 });
  assert.deepEqual(matcher.update(0.2), { matched: false, progress: 0 });
  matcher.update(0.9);
  matcher.update(0.9);
  assert.deepEqual(matcher.update(0.9), { matched: true, progress: 1 });
});

test("rejects one hand and separated fingertips", () => {
  const left = hand({ x: 0.2, y: 0.3, z: 0 }, { x: 0.2, y: 0.6, z: 0 }, { x: 0.2, y: 0.8, z: 0 });
  assert.equal(heartGestureScore([left]), 0);
  const right = hand({ x: 0.8, y: 0.3, z: 0 }, { x: 0.8, y: 0.6, z: 0 }, { x: 0.8, y: 0.8, z: 0 });
  assert.equal(heartGestureScore([left, right]), 0);
});
