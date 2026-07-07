import assert from "node:assert/strict";
import test from "node:test";

import { pointSizeFromBass, scatterFromTreble } from "./audio-visuals.ts";

test("maps bass to a restrained particle size multiplier", () => {
  assert.equal(pointSizeFromBass(0), 1);
  assert.equal(pointSizeFromBass(1), 1.45);
  assert.equal(pointSizeFromBass(2), 1.45);
});

test("maps treble to subtle scatter without overwhelming the silhouette", () => {
  assert.equal(scatterFromTreble(0), 0);
  assert.equal(scatterFromTreble(1), 0.16);
  assert.equal(scatterFromTreble(-1), 0);
});
