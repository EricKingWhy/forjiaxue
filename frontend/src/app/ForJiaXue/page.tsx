"use client";

import { useEffect, useState } from "react";

import { EntryScreen } from "@/components/entry/EntryScreen";
import { ChristmasTreeScreen } from "@/components/christmas-tree/ChristmasTreeScreen";
import { NotesScreen } from "@/components/notes/NotesScreen";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useScrollProgress } from "@/hooks/useScroll";
import { getConfig } from "@/lib/api-client";
import { useConfigStore } from "@/stores";
import { useAudio } from "@/hooks/useAudio";
import { AudioControl } from "@/components/audio/AudioControl";

export default function ForJiaXuePage() {
  const hydrateConfig = useConfigStore((state) => state.hydrate);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useScrollProgress(!isLoading && error === null);
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

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  const scrollToScreen = (screen: string) => {
    document.getElementById(screen)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <AudioControl />
      <main className="h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth">
      <section id="entry" className="min-h-screen snap-start">
        <EntryScreen onStart={() => scrollToScreen("christmas-tree")} />
      </section>
      <section id="christmas-tree" className="relative min-h-screen snap-start">
        <ChristmasTreeScreen onUnlock={() => scrollToScreen("notes")} />
      </section>
      <section id="notes" className="min-h-screen snap-start">
        <NotesScreen />
      </section>
      </main>
    </>
  );
}
