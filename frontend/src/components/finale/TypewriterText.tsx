"use client";

import { useEffect, useMemo, useState } from "react";
import { splitGraphemes } from "@/lib/graphemes";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
}

export function TypewriterText({ text, delay = 0, speed = 58, onComplete }: TypewriterTextProps) {
  const characters = useMemo(() => splitGraphemes(text), [text]);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const immediate = setTimeout(() => {
        setVisible(characters.length);
        onComplete?.();
      }, 0);
      return () => clearTimeout(immediate);
    }
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      setVisible(0);
      interval = setInterval(() => {
        setVisible((current) => {
          const next = Math.min(characters.length, current + 1);
          if (next === characters.length) {
            if (interval) clearInterval(interval);
            onComplete?.();
          }
          return next;
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [characters, delay, onComplete, speed]);

  return <span>{characters.slice(0, visible).join("")}</span>;
}
