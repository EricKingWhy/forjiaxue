import { create } from "zustand";
import type { AudioBands } from "../lib/audio-analyser.ts";

type AudioState = {
  isPlaying: boolean;
  audioElement: HTMLAudioElement | null;
  bass: number;
  mid: number;
  treble: number;
  intensity: number;
  currentTime: number;
  duration: number;
  setAudioElement: (audioElement: HTMLAudioElement | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setBands: (bands: AudioBands) => void;
  setProgress: (currentTime: number, duration: number) => void;
};

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  audioElement: null,
  bass: 0,
  mid: 0,
  treble: 0,
  intensity: 0,
  currentTime: 0,
  duration: 0,
  setAudioElement: (audioElement) => set({ audioElement }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setBands: (bands) => set(bands),
  setProgress: (currentTime, duration) => set({ currentTime, duration }),
}));
