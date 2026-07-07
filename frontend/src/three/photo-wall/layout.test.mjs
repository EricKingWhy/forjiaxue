import assert from "node:assert/strict";
import test from "node:test";

import { createCylindricalLayout } from "./layout.ts";

test("spaces photo cards evenly around a cylinder facing inward", () => {
  const layout = createCylindricalLayout(4, 5);
  assert.equal(layout.length, 4);
  assert.deepEqual(layout[0].position, [0, 0, 5]);
  assert.ok(Math.abs(layout[1].position[0] - 5) < 1e-10);
  assert.ok(Math.abs(layout[1].position[2]) < 1e-10);
  assert.equal(layout[0].rotationY, Math.PI);
  assert.equal(layout[1].rotationY, Math.PI * 1.5);
});

test("returns an empty layout for zero photos", () => {
  assert.deepEqual(createCylindricalLayout(0, 5), []);
});
