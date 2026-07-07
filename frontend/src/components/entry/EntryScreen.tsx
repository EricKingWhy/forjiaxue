"use client";

import { useEffect, useState } from "react";

import {
  PARTICLE_SOURCES,
  nextParticle,
  particleDuration,
  type ParticleIndex,
} from "@/lib/experience-flow";

type EntryScreenProps = { onStart: () => void };

const TRANSITION_MS = 450;

export function EntryScreen({ onStart }: EntryScreenProps) {
  const [active, setActive] = useState<ParticleIndex>(0);
  const [incoming, setIncoming] = useState<ParticleIndex | null>(null);

  useEffect(() => {
    let transitionTimer: ReturnType<typeof setTimeout> | undefined;
    const sceneTimer = setTimeout(() => {
      const next = nextParticle(active);
      setIncoming(next);
      transitionTimer = setTimeout(() => {
        setActive(next);
        setIncoming(null);
      }, TRANSITION_MS);
    }, particleDuration(active));

    return () => {
      clearTimeout(sceneTimer);
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, [active]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#09090b]">
      <iframe
        key={`active-${active}`}
        src={PARTICLE_SOURCES[active]}
        className="absolute inset-0 h-full w-full border-0"
        style={{ pointerEvents: "none" }}
        title={`粒子效果 ${active + 1}`}
      />

      {incoming !== null && (
        <>
          <div className="entry-particle-veil pointer-events-none absolute inset-0 z-10 bg-[#09090b]" />
          <iframe
            key={`incoming-${incoming}`}
            src={PARTICLE_SOURCES[incoming]}
            className="entry-particle-in absolute inset-0 z-20 h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title={`粒子效果 ${incoming + 1}`}
          />
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-40 bg-gradient-to-t from-black/70 to-transparent" />
      <button
        type="button"
        onClick={onStart}
        className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/25 bg-black/45 px-10 py-4 text-sm tracking-[0.3em] text-white backdrop-blur-md transition hover:border-white/45 hover:bg-white/15"
      >
        进 入
      </button>
    </div>
  );
}
