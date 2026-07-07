"use client";

import { useEffect, useRef, useState } from "react";

import { useGesture } from "@/hooks/useGesture";
import {
  MiddleFingerMatcher,
  middleFingerScore,
} from "@/lib/gesture/middle-finger";
import { useConfigStore, useGestureStore } from "@/stores";

type ChristmasTreeScreenProps = {
  onUnlock: () => void;
};

export function ChristmasTreeScreen({ onUnlock }: ChristmasTreeScreenProps) {
  const { videoRef, status, error, landmarks, start, stop } = useGesture();
  const recordAttempt = useGestureStore((state) => state.recordAttempt);
  const attempts = useGestureStore((state) => state.attempts);
  const fallbackText = useConfigStore((state) => state.fallback_button_text);

  const matcher = useRef(new MiddleFingerMatcher());
  const wasTrying = useRef(false);
  const unlocked = useRef(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (unlocked.current) return;

    const score = landmarks.length >= 1 ? middleFingerScore(landmarks[0]) : 0;
    const result = matcher.current.update(score);
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
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* 原始圣诞树项目 - iframe 直接嵌入，完全不改原代码 */}
      <iframe
        src="/christmas-tree/index.html"
        className="absolute inset-0 h-full w-full border-0"
        title="圣诞树"
        allow="camera; microphone"
      />

      {/* 竖中指手势解锁 overlay */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* 摄像头预览 - 右下角 */}
        <div className="absolute bottom-6 right-6">
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

        {/* 进度条 + 按钮 - 底部居中 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          {status === "tracking" && (
            <>
              <div className="h-1 w-56 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200 transition-[width] duration-150"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-sm tracking-[0.18em] text-amber-100/70 drop-shadow-lg">
                {progress > 0 ? "保持竖中指手势…" : "对镜头竖中指解锁"}
              </p>
            </>
          )}

          {status !== "tracking" && (
            <button
              type="button"
              onClick={() => void start()}
              disabled={status === "loading"}
              className="pointer-events-auto rounded-full border border-amber-300/30 bg-black/50 px-7 py-3 text-sm tracking-[0.2em] text-amber-50 backdrop-blur transition hover:bg-amber-900/50 disabled:opacity-50"
            >
              开启手势解锁
            </button>
          )}

          {(attempts >= 4 || status === "error") && (
            <button
              type="button"
              onClick={onUnlock}
              className="pointer-events-auto text-xs tracking-[0.12em] text-amber-100/50 underline decoration-amber-200/20 underline-offset-4 transition hover:text-amber-100/80"
            >
              {fallbackText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
