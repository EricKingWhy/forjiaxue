import assert from "node:assert/strict";
import test from "node:test";

import { rotationFromDrag } from "./useWallRotation.ts";

test("converts horizontal drag and wheel deltas into bounded rotation increments", () => {
  assert.equal(rotationFromDrag(100), 0.5);
  assert.equal(rotationFromDrag(-100), -0.5);
  assert.equal(rotationFromDrag(10_000), 1.2);
});
