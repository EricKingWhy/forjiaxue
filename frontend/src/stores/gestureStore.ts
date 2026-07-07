import { create } from "zustand";

interface GestureState {
  attempts: number;
  recordAttempt: () => void;
  reset: () => void;
}

export const useGestureStore = create<GestureState>((set) => ({
  attempts: 0,
  recordAttempt: () => set((state) => ({ attempts: state.attempts + 1 })),
  reset: () => set({ attempts: 0 }),
}));
