"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { EntryScreen } from "@/components/entry/EntryScreen";
import { ChristmasTreeScreen } from "@/components/christmas-tree/ChristmasTreeScreen";
import { NotesScreen } from "@/components/notes/NotesScreen";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { getConfig } from "@/lib/api-client";
import { nextExperienceScreen, type ExperienceScreen } from "@/lib/experience-flow";
import { useConfigStore } from "@/stores";
import { useAudio } from "@/hooks/useAudio";
import { AudioControl } from "@/components/audio/AudioControl";

export default function ForJiaXuePage() {
  const hydrateConfig = useConfigStore((state) => state.hydrate);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<ExperienceScreen>("entry");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useAudio();

  useEffect(() => {
    getConfig()
      .then((config) => {
        hydrateConfig(config);
        console.info("ForJiaXue config loaded", config);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "配置加载失败");
      })
      .finally(() => setIsLoading(false));
  }, [hydrateConfig]);

  useEffect(() => () => {
    transitionTimers.current.forEach(clearTimeout);
  }, []);

  const advanceFrom = useCallback((expected: ExperienceScreen) => {
    if (isTransitioning || screen !== expected) return;
    setIsTransitioning(true);
    const swapTimer = setTimeout(() => {
      setScreen(nextExperienceScreen(expected));
      const revealTimer = setTimeout(() => setIsTransitioning(false), 50);
      transitionTimers.current.push(revealTimer);
    }, 300);
    transitionTimers.current.push(swapTimer);
  }, [isTransitioning, screen]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <>
      <AudioControl />
      <main className="relative h-dvh overflow-hidden bg-[#09090b]" aria-busy={isTransitioning}>
        {screen === "entry" && <EntryScreen onStart={() => advanceFrom("entry")} />}
        {screen === "christmas-tree" && (
          <ChristmasTreeScreen onUnlock={() => advanceFrom("christmas-tree")} />
        )}
        {screen === "notes" && <NotesScreen />}
        <div
          className={`pointer-events-none absolute inset-0 z-[1000] bg-[#09090b] transition-opacity duration-300 ${isTransitioning ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        />
      </main>
    </>
  );
}
