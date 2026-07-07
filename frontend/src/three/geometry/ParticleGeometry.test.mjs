import assert from "node:assert/strict";
import test from "node:test";

import { createParticleGeometry } from "./ParticleGeometry.ts";

test("creates a configurable Float32 position attribute", () => {
  const geometry = createParticleGeometry({ count: 4, random: () => 0.5 });
  const position = geometry.getAttribute("position");

  assert.ok(position.array instanceof Float32Array);
  assert.equal(position.count, 4);
  assert.equal(position.array.length, 12);
});

test("creates an RGB color for every particle", () => {
  const geometry = createParticleGeometry({ count: 3, random: () => 0.25 });
  const color = geometry.getAttribute("color");

  assert.ok(color.array instanceof Float32Array);
  assert.equal(color.itemSize, 3);
  assert.equal(color.count, 3);
  assert.equal(color.array.length, 9);
});

test("creates one positive size value per particle", () => {
  const geometry = createParticleGeometry({ count: 5, random: () => 0.5 });
  const size = geometry.getAttribute("size");

  assert.ok(size.array instanceof Float32Array);
  assert.equal(size.itemSize, 1);
  assert.equal(size.count, 5);
  assert.ok(Array.from(size.array).every((value) => value > 0));
});

test("stores target positions for aggregation", () => {
  const targetPositions = new Float32Array([1, 2, 0, 3, 4, 0]);
  const geometry = createParticleGeometry({ count: 2, targetPositions });

  assert.deepEqual(
    Array.from(geometry.getAttribute("targetPosition").array),
    Array.from(targetPositions),
  );
});

test("stores deterministic scattered initial positions", () => {
  const geometry = createParticleGeometry({ count: 2, random: () => 0.75 });
  const initial = geometry.getAttribute("initialPosition");

  assert.equal(initial.count, 2);
  assert.deepEqual(Array.from(initial.array), [2.75, 2, 1.25, 2.75, 2, 1.25]);
});

test("uses supplied particle-map colors", () => {
  const colors = new Float32Array([1, 0.5, 0.25, 0.2, 0.3, 0.4]);
  const geometry = createParticleGeometry({ count: 2, colors });
  assert.deepEqual(Array.from(geometry.getAttribute("color").array), Array.from(colors));
});
