import assert from "node:assert/strict";
import test from "node:test";

import { useGestureStore } from "./gestureStore.ts";

test("counts completed attempts and resets the unlock session", () => {
  useGestureStore.getState().reset();
  useGestureStore.getState().recordAttempt();
  useGestureStore.getState().recordAttempt();
  assert.equal(useGestureStore.getState().attempts, 2);
  useGestureStore.getState().reset();
  assert.equal(useGestureStore.getState().attempts, 0);
});
