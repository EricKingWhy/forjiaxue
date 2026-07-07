import assert from "node:assert/strict";
import test from "node:test";

import { resolveApiUrl } from "./api-client.ts";

test("resolves backend-relative media URLs against the API origin", () => {
  assert.equal(
    resolveApiUrl("/uploads/particle_map/main.json"),
    "http://localhost:8000/uploads/particle_map/main.json",
  );
});

test("preserves absolute media URLs", () => {
  assert.equal(resolveApiUrl("https://cdn.example/photo.webp"), "https://cdn.example/photo.webp");
});
