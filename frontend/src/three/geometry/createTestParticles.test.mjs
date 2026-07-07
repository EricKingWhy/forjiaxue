import assert from "node:assert/strict";
import test from "node:test";

import { createTestParticles } from "./createTestParticles.ts";

test("creates 1000 random particle positions by default", () => {
  const geometry = createTestParticles(() => 0.5);
  const positions = geometry.getAttribute("position");

  assert.equal(positions.count, 1000);
  assert.equal(positions.array.length, 3000);
  assert.deepEqual(Array.from(positions.array.slice(0, 3)), [0, 0, 0]);
});
