"use client";

import { useCallback, useEffect, useState } from "react";

import { getBlessing } from "@/lib/api-client";
import type { FinaleStage } from "@/lib/finale-particles";
import { FinaleParticles } from "./FinaleParticles";
import { TypewriterText } from "./TypewriterText";

const DEFAULT_BLESSING = [
  "愿往后的每一段路，都有光落在你肩上。",
  "愿寻常日子因你的笑，变得值得珍藏。",
  "嘉雪，故事未完，浪漫也未完。",
];

export function FinaleScreen() {
  const [stage, setStage] = useState<FinaleStage>("gathering");
  const [paragraphs, setParagraphs] = useState(DEFAULT_BLESSING);
  const [visibleParagraphs, setVisibleParagraphs] = useState(1);

  useEffect(() => {
    let cancelled = false;
    getBlessing()
      .then((result) => {
        const valid = result.paragraphs.map((item) => item.trim()).filter(Boolean);
        if (!cancelled && valid.length) setParagraphs(valid);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const revealNext = useCallback(() => {
    setVisibleParagraphs((count) => Math.min(paragraphs.length, count + 1));
  }, [paragraphs.length]);

  const showBlessing = stage === "portrait";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090308] text-[#f4e8e3]">
      <div className="absolute inset-0"><FinaleParticles onStage={setStage} /></div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(9,3,8,.12)_42%,rgba(9,3,8,.88)_100%)]" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-end px-6 pb-[max(3.5rem,env(safe-area-inset-bottom))] pt-16 text-center">
        <p className="mb-auto text-[10px] uppercase tracking-[0.48em] text-[#c99191]/70">A quiet bloom for Jiaxue</p>
        <div className={`max-w-xl transition-all duration-1000 ${showBlessing ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`} aria-live="polite">
          <div className="mb-7 mx-auto h-px w-12 bg-[#c99191]/60" />
          {paragraphs.slice(0, visibleParagraphs).map((paragraph, index) => (
            <p key={`${index}-${paragraph}`} className={`mb-3 ${index === paragraphs.length - 1 ? "font-serif text-xl tracking-[0.12em] text-[#f1d0ca]" : "text-sm leading-7 tracking-[0.16em] text-[#e5d4cf]/85"}`}>
              <TypewriterText text={paragraph} delay={index === 0 ? 350 : 120} onComplete={revealNext} />
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
