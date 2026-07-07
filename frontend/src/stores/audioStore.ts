import { create } from "zustand";

type AudioState = {
  isPlaying: boolean;
  audioElement: HTMLAudioElement | null;
  setAudioElement: (audioElement: HTMLAudioElement | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
};

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  audioElement: null,
  setAudioElement: (audioElement) => set({ audioElement }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));
