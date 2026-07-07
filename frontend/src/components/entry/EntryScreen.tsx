"use client";

import { useState } from "react";

import { PasswordEntry } from "./PasswordEntry";
import { PetalField } from "./PetalField";
import { useConfigStore } from "@/stores";
import { useAudioStore } from "@/stores";
import { toggleAudioPlayback } from "@/hooks/useAudio";

type EntryScreenProps = {
  onStart: () => void;
};

export function EntryScreen({ onStart }: EntryScreenProps) {
  const passwordEnabled = useConfigStore((state) => state.visitor_password_enabled);
  const [isUnlocked, setIsUnlocked] = useState(!passwordEnabled);
  const audioElement = useAudioStore((state) => state.audioElement);

  const beginJourney = async () => {
    if (audioElement?.paused) {
      try {
        await toggleAudioPlayback(audioElement);
      } catch {
        // The visual journey remains available when a local media file is absent.
      }
    }
    onStart();
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#090507] px-6 text-center text-rose-50">
      <PetalField />
      <div className="relative z-10 w-full max-w-2xl">
        <p className="mb-6 text-[10px] tracking-[0.62em] text-[#c9a78f]/70 sm:text-xs">A PRIVATE STORY</p>
        <h1 className="text-4xl font-light leading-[1.28] tracking-[0.12em] text-[#f5e9e8] sm:text-6xl">
          献给嘉雪
        </h1>
        <div className="mx-auto my-7 h-px w-16 bg-gradient-to-r from-transparent via-[#c6917e]/65 to-transparent" />
        <p className="mb-10 text-sm font-light tracking-[0.26em] text-rose-100/55 sm:text-base">
          有些心意，值得被认真收藏
        </p>
        {isUnlocked ? (
          <button
            type="button"
            onClick={() => void beginJourney()}
            className="rounded-full border border-[#d3a18e]/35 bg-[#3f1723]/45 px-9 py-3.5 text-sm tracking-[0.28em] text-[#f7e9e6] shadow-[0_18px_70px_rgba(100,25,48,0.24)] backdrop-blur-xl transition duration-500 hover:border-[#e7b8a4]/65 hover:bg-[#572031]/55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d9aa98]"
          >
            开启这段旅程
          </button>
        ) : (
          <PasswordEntry onSuccess={() => setIsUnlocked(true)} />
        )}
      </div>
    </div>
  );
}
