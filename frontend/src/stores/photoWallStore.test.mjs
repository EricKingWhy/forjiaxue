import assert from "node:assert/strict";
import test from "node:test";

import { usePhotoWallStore } from "./photoWallStore.ts";

test("selects and clears exactly one wall photo", () => {
  const photo = { id: 7, webp_url: "/uploads/webp/7.webp" };
  usePhotoWallStore.getState().selectPhoto(photo);
  assert.equal(usePhotoWallStore.getState().selectedPhoto?.id, 7);
  usePhotoWallStore.getState().clearSelection();
  assert.equal(usePhotoWallStore.getState().selectedPhoto, null);
});
