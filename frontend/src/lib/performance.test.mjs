import assert from "node:assert/strict";
import test from "node:test";

import { getParticleCount, shouldEnableBloom, tierForFps, tierForFpsSamples } from "./performance.ts";

test("maps performance tiers to required particle budgets", () => {
  assert.deepEqual(
    [getParticleCount("high"), getParticleCount("medium"), getParticleCount("low")],
    [60000, 30000, 12000],
  );
});

test("downgrades tiers when measured frame rate is insufficient", () => {
  assert.equal(tierForFps("high", 55), "high");
  assert.equal(tierForFps("high", 42), "medium");
  assert.equal(tierForFps("medium", 24), "low");
  assert.equal(tierForFps("low", 60), "low");
});

test("disables bloom for low-tier or explicit configuration", () => {
  assert.equal(shouldEnableBloom("low"), false);
  assert.equal(shouldEnableBloom("high", false), false);
  assert.equal(shouldEnableBloom("medium", true), true);
});

test("only downgrades after sustained low frame-rate samples", () => {
  assert.equal(tierForFpsSamples("high", [58, 24, 56]), "high");
  assert.equal(tierForFpsSamples("high", [27, 25, 55]), "low");
  assert.equal(tierForFpsSamples("high", [44, 43, 54]), "medium");
});
