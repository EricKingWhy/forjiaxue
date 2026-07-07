import type { HandLandmarker } from "@mediapipe/tasks-vision";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

interface HandLandmarkerApi<TVision, TResult> {
  resolveFiles: (url: string) => Promise<TVision>;
  create: (vision: TVision, options: {
    baseOptions: { modelAssetPath: string; delegate: "GPU" };
    runningMode: "VIDEO";
    numHands: number;
    minHandDetectionConfidence: number;
    minTrackingConfidence: number;
  }) => Promise<TResult>;
}

export async function createHandLandmarker<TVision, TResult>(
  api: HandLandmarkerApi<TVision, TResult>,
): Promise<TResult> {
  const vision = await api.resolveFiles(WASM_URL);
  return api.create(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.55,
    minTrackingConfidence: 0.55,
  });
}

export async function initializeHandLandmarker(): Promise<HandLandmarker> {
  const { FilesetResolver, HandLandmarker: MediaPipeHandLandmarker } =
    await import("@mediapipe/tasks-vision");
  return createHandLandmarker({
    resolveFiles: (url) => FilesetResolver.forVisionTasks(url),
    create: (vision, options) => MediaPipeHandLandmarker.createFromOptions(vision, options),
  });
}
