import assert from "node:assert/strict";
import test from "node:test";

import {
  createRoseTargets,
  finaleStageAt,
} from "./finale-particles.ts";

test("rose targets are finite, centered and contain the requested points", () => {
  const targets = createRoseTargets(600);
  assert.equal(targets.length, 1_800);
  assert.ok([...targets].every(Number.isFinite));
  const xs = [...targets].filter((_, index) => index % 3 === 0);
  assert.ok(Math.min(...xs) < -1);
  assert.ok(Math.max(...xs) > 1);
});

test("finale timeline moves from gathering through portrait", () => {
  assert.equal(finaleStageAt(0), "gathering");
  assert.equal(finaleStageAt(2_500), "rose");
  assert.equal(finaleStageAt(5_500), "shattering");
  assert.equal(finaleStageAt(8_500), "portrait");
});
