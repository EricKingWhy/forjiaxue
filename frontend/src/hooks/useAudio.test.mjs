import assert from "node:assert/strict";
import test from "node:test";

import { connectMusicElement, createAudioContext, createMusicElement, resumeAudioContext } from "./useAudio.ts";

test("creates and resumes a suspended audio context from the user action path", async () => {
  let resumes = 0;
  class FakeAudioContext {
    state = "suspended";
    async resume() {
      resumes += 1;
      this.state = "running";
    }
  }
  const context = createAudioContext(FakeAudioContext);
  await resumeAudioContext(context);
  assert.equal(context.state, "running");
  assert.equal(resumes, 1);
});

test("creates a reusable audio element from an API music track", () => {
  const element = createMusicElement(
    { id: 1, music_url: "/uploads/music/song.mp3", original_filename: "song.mp3" },
    (source) => ({ src: source, preload: "", loop: false }),
  );
  assert.equal(element.src, "http://localhost:8000/uploads/music/song.mp3");
  assert.equal(element.preload, "auto");
  assert.equal(element.loop, true);
});

test("does not resume a context that is already running", async () => {
  const context = { state: "running", resume: async () => assert.fail("unexpected resume") };
  await resumeAudioContext(context);
});

test("connects a media element to an audio context only once", () => {
  let sourceCreations = 0;
  let connections = 0;
  const source = { connect: () => { connections += 1; } };
  const context = {
    destination: {},
    createMediaElementSource: () => { sourceCreations += 1; return source; },
  };
  const element = {};
  assert.equal(connectMusicElement(context, element), source);
  assert.equal(connectMusicElement(context, element), source);
  assert.equal(sourceCreations, 1);
  assert.equal(connections, 1);
});
