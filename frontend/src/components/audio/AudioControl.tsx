"use client";

import { toggleAudioPlayback } from "@/hooks/useAudio";
import { useAudioStore } from "@/stores";

export function AudioControl() {
  const element = useAudioStore((state) => state.audioElement);
  const isPlaying = useAudioStore((state) => state.isPlaying);

  if (!element) return null;
  return (
    <button
      type="button"
      onClick={() => void toggleAudioPlayback(element)}
      className="fixed right-5 top-5 z-50 grid h-11 w-11 place-items-center rounded-full border border-rose-100/15 bg-black/30 text-sm text-rose-50/85 shadow-[0_10px_40px_rgba(80,20,40,0.25)] backdrop-blur-xl transition hover:border-rose-100/30 hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
      aria-label={isPlaying ? "暂停背景音乐" : "播放背景音乐"}
      aria-pressed={isPlaying}
    >
      {isPlaying ? "Ⅱ" : "▶"}
    </button>
  );
}
