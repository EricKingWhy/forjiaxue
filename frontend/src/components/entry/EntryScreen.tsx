"use client";

import { useState } from "react";

import { PasswordEntry } from "./PasswordEntry";
import { useConfigStore } from "@/stores";

type EntryScreenProps = {
  onStart: () => void;
};

export function EntryScreen({ onStart }: EntryScreenProps) {
  const passwordEnabled = useConfigStore((state) => state.visitor_password_enabled);
  const [isUnlocked, setIsUnlocked] = useState(!passwordEnabled);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,207,232,0.7),_transparent_55%)]"
        aria-hidden="true"
        data-testid="petal-placeholder"
      />
      <div className="relative z-10 max-w-xl">
        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-rose-700/70">For JiaXue</p>
        <h1 className="mb-6 text-4xl font-semibold text-rose-950 sm:text-6xl">
          一段只为你准备的旅程
        </h1>
        {isUnlocked ? (
          <button
            type="button"
            onClick={onStart}
            className="rounded-full bg-rose-600 px-8 py-3 text-white shadow-lg shadow-rose-200"
          >
            开始浪漫之旅
          </button>
        ) : (
          <PasswordEntry onSuccess={() => setIsUnlocked(true)} />
        )}
      </div>
    </div>
  );
}
