import assert from "node:assert/strict";
import test from "node:test";

import { useAudioStore } from "./audioStore.ts";

test("stores normalized audio energy bands", () => {
  useAudioStore.getState().setBands({ bass: 0.2, mid: 0.4, treble: 0.6, intensity: 0.3 });
  const state = useAudioStore.getState();
  assert.deepEqual(
    { bass: state.bass, mid: state.mid, treble: state.treble, intensity: state.intensity },
    { bass: 0.2, mid: 0.4, treble: 0.6, intensity: 0.3 },
  );
});

test("tracks playback progress and duration", () => {
  useAudioStore.getState().setProgress(12.5, 180);
  const state = useAudioStore.getState();
  assert.equal(state.currentTime, 12.5);
  assert.equal(state.duration, 180);
});
