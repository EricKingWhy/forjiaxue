"use client";

import { useEffect, useRef, useState } from "react";

import { useGesture } from "@/hooks/useGesture";
import {
  HeartGestureMatcher,
  heartGestureScore,
} from "@/lib/gesture/heart-gesture";
import {
  MiddleFingerMatcher,
  middleFingerScore,
} from "@/lib/gesture/middle-finger";
import { useConfigStore, useGestureStore } from "@/stores";

type GestureOverlayProps = {
  onUnlock: () => void;
  onActiveChange?: (active: boolean) => void;
};

export function GestureOverlay({ onUnlock, onActiveChange }: GestureOverlayProps) {
  const { videoRef, status, error, landmarks, start, stop } = useGesture();
  const recordAttempt = useGestureStore((state) => state.recordAttempt);
  const attempts = useGestureStore((state) => state.attempts);
  const fallbackText = useConfigStore((state) => state.fallback_button_text);

  const heartMatcher = useRef(new HeartGestureMatcher());
  const middleMatcher = useRef(new MiddleFingerMatcher());
  const wasTrying = useRef(false);
  const unlocked = useRef(false);
  const [progress, setProgress] = useState(0);
  const [gestureType, setGestureType] = useState<"heart" | "middle" | null>(null);

  useEffect(() => {
    if (unlocked.current) return;

    // Try heart gesture (requires 2 hands)
    const heartScore = heartGestureScore(landmarks);
    const heartResult = heartMatcher.current.update(heartScore);

    // Try middle finger gesture (requires 1 hand, take first detected)
    const middleScore = landmarks.length >= 1 ? middleFingerScore(landmarks[0]) : 0;
    const middleResult = middleMatcher.current.update(middleScore);

    // Use the higher progress
    const currentProgress = Math.max(heartResult.progress, middleResult.progress);
    setProgress(currentProgress);

    if (heartScore >= 0.45 || middleScore >= 0.45) {
      wasTrying.current = true;
      setGestureType(heartScore >= middleScore ? "heart" : "middle");
    }

    if (heartScore === 0 && middleScore === 0 && wasTrying.current) {
      wasTrying.current = false;
      setGestureType(null);
      recordAttempt();
    }

    if (heartResult.matched || middleResult.matched) {
      unlocked.current = true;
      stop();
      onUnlock();
    }
  }, [landmarks, onUnlock, recordAttempt, stop]);

  useEffect(() => {
    onActiveChange?.(status === "tracking");
  }, [status, onActiveChange]);

  const gestureHint = gestureType === "heart"
    ? "保持比心手势…"
    : gestureType === "middle"
    ? "保持竖中指手势…"
    : landmarks.length >= 2
    ? "双手比心 或 单手竖中指"
    : "双手比心 或 单手竖中指";

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-12">
      {/* Webcam preview - bottom right */}
      <div className="absolute bottom-8 right-8">
        <div className="relative aspect-video w-56 overflow-hidden rounded-2xl border border-amber-300/30 bg-black/50 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur">
          <video ref={videoRef} muted playsInline className="h-full w-full -scale-x-100 object-cover opacity-80" />
          {status !== "tracking" && (
            <div className="absolute inset-0 grid place-items-center bg-black/70 px-3 text-center">
              <p className="text-xs font-light tracking-wider text-amber-100/60">
                {status === "loading" ? "正在唤醒镜头…" : error ?? "点击下方按钮开启"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress + controls - bottom center */}
      <div className="flex flex-col items-center gap-4">
        {status === "tracking" && (
          <>
            <div className="h-1 w-56 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200 transition-[width] duration-150"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-sm tracking-[0.18em] text-amber-100/60">
              {gestureHint}
            </p>
          </>
        )}

        {status !== "tracking" && (
          <button
            type="button"
            onClick={() => void start()}
            disabled={status === "loading"}
            className="pointer-events-auto rounded-full border border-amber-300/30 bg-black/40 px-7 py-3 text-sm tracking-[0.2em] text-amber-50 backdrop-blur transition hover:bg-amber-900/40 disabled:opacity-50"
          >
            开启手势解锁
          </button>
        )}

        {(attempts >= 4 || status === "error") && (
          <button
            type="button"
            onClick={onUnlock}
            className="pointer-events-auto text-xs tracking-[0.12em] text-amber-100/45 underline decoration-amber-200/20 underline-offset-4 transition hover:text-amber-100/75"
          >
            {fallbackText}
          </button>
        )}
      </div>
    </div>
  );
}
