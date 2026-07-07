import assert from "node:assert/strict";
import test from "node:test";

import { animateProgress } from "./useProgressAnimation.ts";

test("animates progress from zero to one over six seconds", () => {
  const uniform = { value: 0 };
  const tween = animateProgress(uniform);

  assert.equal(tween.duration(), 6);
  tween.progress(1);
  assert.equal(uniform.value, 1);
  tween.kill();
});
