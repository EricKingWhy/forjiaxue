import assert from "node:assert/strict";
import test from "node:test";

import { createHandLandmarker } from "./hand-landmarker.ts";

test("initializes MediaPipe in video mode for two hands", async () => {
  let receivedOptions;
  const api = {
    resolveFiles: async (url) => ({ url }),
    create: async (_vision, options) => { receivedOptions = options; return { close() {} }; },
  };
  const result = await createHandLandmarker(api);
  assert.equal(receivedOptions.runningMode, "VIDEO");
  assert.equal(receivedOptions.numHands, 2);
  assert.equal(receivedOptions.baseOptions.delegate, "GPU");
  assert.equal(typeof result.close, "function");
});
