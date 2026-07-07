"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";

import { initializeHandLandmarker } from "@/lib/gesture/hand-landmarker";

export type GestureStatus = "idle" | "loading" | "tracking" | "error";

export function useGesture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef(0);
  const lastVideoTime = useRef(-1);
  const [status, setStatus] = useState<GestureStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[][]>([]);

  const dispose = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
  }, []);

  const stop = useCallback(() => {
    dispose();
    setLandmarks([]);
    setStatus("idle");
  }, [dispose]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
      setError("当前设备无法使用摄像头");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const [landmarker, stream] = await Promise.all([
        initializeHandLandmarker(),
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        }),
      ]);
      landmarkerRef.current = landmarker;
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus("tracking");

      const detect = () => {
        const video = videoRef.current;
        const detector = landmarkerRef.current;
        if (!video || !detector) return;
        if (video.readyState >= 2 && video.currentTime !== lastVideoTime.current) {
          lastVideoTime.current = video.currentTime;
          const result = detector.detectForVideo(video, performance.now());
          setLandmarks(result.landmarks);
        }
        frameRef.current = requestAnimationFrame(detect);
      };
      frameRef.current = requestAnimationFrame(detect);
    } catch (reason) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setError(
        reason instanceof DOMException && reason.name === "NotAllowedError"
          ? "摄像头权限被拒绝"
          : "手势识别暂时无法启动",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => dispose, [dispose]);
  return { videoRef, status, error, landmarks, start, stop };
}
