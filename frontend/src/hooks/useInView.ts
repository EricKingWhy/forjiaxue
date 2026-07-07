"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element is currently intersecting the viewport.
 *
 * Used to pause WebGL Canvas render loops (via R3F `frameloop`) when a
 * section scrolls off-screen, so only the visible 3D scene keeps rendering.
 * This is the single biggest win on a page that mounts several heavy Canvases
 * at once — without it, every Canvas renders at 60fps even when off-screen.
 */
export function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Default: visible as soon as any part enters the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.01, ...options },
    );
    observer.observe(element);
    return () => observer.disconnect();
    // options is read once on mount; callers should pass a stable value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
