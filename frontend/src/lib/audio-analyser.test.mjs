import assert from "node:assert/strict";
import test from "node:test";

import { calculateAudioBands, createAnalyser } from "./audio-analyser.ts";

test("creates an analyser with FFT 256 and 128 frequency bins", () => {
  const analyser = { fftSize: 0, smoothingTimeConstant: 0, frequencyBinCount: 128 };
  const context = { createAnalyser: () => analyser };
  assert.equal(createAnalyser(context), analyser);
  assert.equal(analyser.fftSize, 256);
  assert.equal(analyser.smoothingTimeConstant, 0.78);
  assert.equal(analyser.frequencyBinCount, 128);
});

test("returns normalized bass, mid, treble, and total energy", () => {
  const data = new Uint8Array(128).fill(128);
  const bands = calculateAudioBands(data, 48_000, 256);
  for (const value of Object.values(bands)) {
    assert.ok(value >= 0 && value <= 1);
    assert.ok(Math.abs(value - 128 / 255) < 0.001);
  }
});
