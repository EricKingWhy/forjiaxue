import assert from "node:assert/strict";
import test from "node:test";

import { loadImageData } from "./image-loader.ts";

test("loads an image and returns its pixels at natural dimensions", async () => {
  const expected = { width: 2, height: 3, data: new Uint8ClampedArray(24) };
  const image = { naturalWidth: 2, naturalHeight: 3, onload: null, onerror: null };
  Object.defineProperty(image, "src", {
    set() {
      queueMicrotask(() => image.onload?.());
    },
  });
  const context = {
    drawImage() {},
    getImageData: () => expected,
  };
  const canvas = { width: 0, height: 0, getContext: () => context };

  const result = await loadImageData("/photo.webp", {
    createImage: () => image,
    createCanvas: () => canvas,
  });

  assert.equal(result, expected);
  assert.equal(canvas.width, 2);
  assert.equal(canvas.height, 3);
});
