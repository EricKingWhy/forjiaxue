import { create } from "zustand";

import type { ScreenName } from "@/types";

type ScreenState = {
  currentScreen: ScreenName;
  screensCompleted: ScreenName[];
  setCurrentScreen: (screen: ScreenName) => void;
  markScreenCompleted: (screen: ScreenName) => void;
};

export const useScreenStore = create<ScreenState>((set) => ({
  currentScreen: "entry",
  screensCompleted: [],
  setCurrentScreen: (currentScreen) => set({ currentScreen }),
  markScreenCompleted: (screen) =>
    set((state) => ({
      screensCompleted: state.screensCompleted.includes(screen)
        ? state.screensCompleted
        : [...state.screensCompleted, screen],
    })),
}));
