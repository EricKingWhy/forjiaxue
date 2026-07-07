import assert from "node:assert/strict";
import test from "node:test";

import { createHeartTargets, parseParticleMap, sampleImagePixels } from "./particle-utils.ts";

test("samples opaque image pixels on the requested grid", () => {
  const image = {
    width: 2,
    height: 2,
    data: new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 0,
      0, 0, 255, 255, 255, 255, 255, 255,
    ]),
  };

  const particles = sampleImagePixels(image, 1);

  assert.equal(particles.length, 3);
  assert.deepEqual(particles[0], { x: -0.5, y: 0.5, color: [1, 0, 0] });
});

test("parses backend particle-map JSON into normalized colors", () => {
  const particles = parseParticleMap(
    JSON.stringify([{ x: 12, y: 8, color: "#ff8040" }]),
  );

  assert.deepEqual(particles, [
    { x: 12, y: 8, color: [1, 128 / 255, 64 / 255] },
  ]);
});

test("creates a bounded heart silhouette for the no-photo fallback", () => {
  const positions = createHeartTargets(100, () => 0.5);
  assert.equal(positions.length, 300);
  assert.ok(Array.from(positions).every(Number.isFinite));
  assert.ok(Math.max(...positions) <= 4.5);
  assert.ok(Math.min(...positions) >= -4.5);
});
