import assert from "node:assert/strict";
import test from "node:test";

import {
  PARTICLE_SOURCES,
  nextExperienceScreen,
  nextParticle,
  particleDuration,
} from "./experience-flow.ts";

test("cycles through all three particle scenes", () => {
  assert.equal(nextParticle(0), 1);
  assert.equal(nextParticle(1), 2);
  assert.equal(nextParticle(2), 0);
  assert.deepEqual(PARTICLE_SOURCES, [
    "/particle-effect-1.html",
    "/particle-effect-2.html",
    "/particle-effect-3.html",
  ]);
});

test("uses the approved 5, 6 and 8 second schedule", () => {
  assert.equal(particleDuration(0), 5_000);
  assert.equal(particleDuration(1), 6_000);
  assert.equal(particleDuration(2), 8_000);
});

test("only advances through the gated experience order", () => {
  assert.equal(nextExperienceScreen("entry"), "christmas-tree");
  assert.equal(nextExperienceScreen("christmas-tree"), "notes");
  assert.equal(nextExperienceScreen("notes"), "notes");
});
