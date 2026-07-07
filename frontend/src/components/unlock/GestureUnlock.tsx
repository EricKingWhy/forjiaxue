"use client";

import { useEffect, useRef, useState } from "react";

import { useGesture } from "@/hooks/useGesture";
import {
  HeartGestureMatcher,
  heartGestureScore,
} from "@/lib/gesture/heart-gesture";
import { useConfigStore, useGestureStore } from "@/stores";

export function GestureUnlock({ onUnlock }: { onUnlock: () => void }) {
  const { videoRef, status, error, landmarks, start, stop } = useGesture();
  const recordAttempt = useGestureStore((state) => state.recordAttempt);
  const attempts = useGestureStore((state) => state.attempts);
  const fallbackText = useConfigStore((state) => state.fallback_button_text);
  const matcher = useRef(new HeartGestureMatcher());
  const wasTrying = useRef(false);
  const unlocked = useRef(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (unlocked.current) return;
    const score = heartGestureScore(landmarks);
    const result = matcher.current.update(score);
    // Detector frames are an external stream; progress mirrors that stream.
    setProgress(result.progress);
    if (score >= 0.45) wasTrying.current = true;
    if (score === 0 && wasTrying.current) {
      wasTrying.current = false;
      recordAttempt();
    }
    if (result.matched) {
      unlocked.current = true;
      stop();
      onUnlock();
    }
  }, [landmarks, onUnlock, recordAttempt, stop]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
      <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-[2rem] border border-rose-100/10 bg-black/35 shadow-[0_30px_100px_rgba(80,20,45,0.25)]">
        <video ref={videoRef} muted playsInline className="h-full w-full -scale-x-100 object-cover opacity-75" />
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/5" />
        {status !== "tracking" && (
          <div className="absolute inset-0 grid place-items-center bg-[#0a0508]/80 px-8">
            <p className="text-sm font-light tracking-[0.16em] text-rose-50/65">
              {status === "loading" ? "正在唤醒镜头…" : error ?? "用双手比一个心，开启最后的惊喜"}
            </p>
          </div>
        )}
      </div>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#925066] to-[#e1b29f] transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      {status === "tracking" ? (
        <p className="text-sm tracking-[0.18em] text-rose-100/55">
          {landmarks.length >= 2 ? "保持这个心意…" : "让两只手都进入画面"}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => void start()}
          disabled={status === "loading"}
          className="rounded-full border border-[#d3a18e]/30 bg-[#3f1723]/45 px-7 py-3 text-sm tracking-[0.2em] text-rose-50 transition hover:bg-[#572031]/55 disabled:opacity-50"
        >
          开启手势识别
        </button>
      )}
      {(attempts >= 4 || status === "error") && (
        <button
          type="button"
          onClick={onUnlock}
          className="text-xs tracking-[0.12em] text-rose-100/45 underline decoration-rose-200/20 underline-offset-4 transition hover:text-rose-100/75"
        >
          {fallbackText}
        </button>
      )}
    </div>
  );
}
