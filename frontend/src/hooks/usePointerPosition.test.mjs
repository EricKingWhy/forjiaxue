import assert from "node:assert/strict";
import test from "node:test";

import { normalizePointer } from "./usePointerPosition.ts";

test("normalizes pointer coordinates to minus one through one", () => {
  assert.deepEqual(normalizePointer(50, 25, { left: 0, top: 0, width: 100, height: 100 }), {
    x: 0,
    y: 0.5,
  });
});
