"use client";

import { useEffect } from "react";

import { useScreenStore } from "@/stores";
import type { ScreenName } from "@/types";

const SCREEN_IDS: ScreenName[] = ["entry", "particles", "wall", "unlock", "finale"];

export function useScrollProgress(enabled: boolean) {
  const setCurrentScreen = useScreenStore((state) => state.setCurrentScreen);
  const markScreenCompleted = useScreenStore((state) => state.markScreenCompleted);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const screen = entry.target.id as ScreenName;
          setCurrentScreen(screen);
          markScreenCompleted(screen);
          console.info("ForJiaXue screen progress", screen);
        }
      },
      { threshold: 0.6 },
    );

    const sections = SCREEN_IDS.map((id) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [enabled, markScreenCompleted, setCurrentScreen]);
}
