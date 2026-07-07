import assert from "node:assert/strict";
import test from "node:test";

import { normalizeSecretMessage } from "./message-validation.ts";

test("normalizes a meaningful secret message", () => {
  assert.equal(normalizeSecretMessage("  愿你天天开心  "), "愿你天天开心");
});

test("rejects empty and oversized messages", () => {
  assert.equal(normalizeSecretMessage("   "), null);
  assert.equal(normalizeSecretMessage("心".repeat(501)), null);
});
