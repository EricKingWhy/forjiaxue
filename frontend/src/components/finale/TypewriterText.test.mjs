import assert from "node:assert/strict";
import test from "node:test";

import { splitGraphemes } from "../../lib/graphemes.ts";

test("splitGraphemes keeps Chinese and emoji intact", () => {
  assert.deepEqual(splitGraphemes("嘉雪🌹"), ["嘉", "雪", "🌹"]);
});
