"use client";

import { useEffect, useState } from "react";

import { EntryScreen } from "@/components/entry/EntryScreen";
import { FinaleScreen } from "@/components/finale/FinaleScreen";
import { ParticleScreen } from "@/components/particles/ParticleScreen";
import { PhotoWallScreen } from "@/components/photo-wall/PhotoWallScreen";
import { UnlockScreen } from "@/components/unlock/UnlockScreen";
import { NextButton } from "@/components/ui/NextButton";
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
        <EntryScreen onStart={() => scrollToScreen("particles")} />
      </section>
      <section id="particles" className="relative min-h-screen snap-start">
        <ParticleScreen />
        <NextButton targetId="wall" />
      </section>
      <section id="wall" className="relative min-h-screen snap-start">
        <PhotoWallScreen />
        <NextButton targetId="unlock" />
      </section>
      <section id="unlock" className="relative min-h-screen snap-start">
        <UnlockScreen onUnlock={() => scrollToScreen("finale")} />
      </section>
      <section id="finale" className="min-h-screen snap-start">
        <FinaleScreen />
      </section>
      </main>
    </>
  );
}
