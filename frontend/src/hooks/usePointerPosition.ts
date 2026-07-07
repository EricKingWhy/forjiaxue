"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";

type Bounds = Pick<DOMRect, "left" | "top" | "width" | "height">;

export interface NormalizedPointer {
  x: number;
  y: number;
}

export function normalizePointer(
  clientX: number,
  clientY: number,
  bounds: Bounds,
): NormalizedPointer {
  return {
    x: ((clientX - bounds.left) / bounds.width) * 2 - 1,
    y: -((clientY - bounds.top) / bounds.height) * 2 + 1,
  };
}

const OFFSCREEN: NormalizedPointer = { x: 10, y: 10 };

/**
 * Tracks pointer position via a ref (no per-move re-render) and exposes a
 * low-frequency `isPointerActive` state that flips only on enter/leave.
 *
 * Consumers read `pointerRef.current` inside `useFrame` to push the latest
 * normalized coordinates into a shader uniform each frame, avoiding the
 * 60-120Hz React re-renders that a `useState` pointer would cause.
 */
export function usePointerPosition() {
  const pointerRef = useRef<NormalizedPointer>(OFFSCREEN);
  const activeRef = useRef(false);
  const [isPointerActive, setIsPointerActive] = useState(false);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    pointerRef.current = normalizePointer(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect(),
    );
    // Only flip state on the false→true edge; subsequent moves are ref-only.
    if (!activeRef.current) {
      activeRef.current = true;
      setIsPointerActive(true);
    }
  }, []);

  const onPointerLeave = useCallback(() => {
    pointerRef.current = OFFSCREEN;
    activeRef.current = false;
    setIsPointerActive(false);
  }, []);

  return { pointerRef, isPointerActive, onPointerMove, onPointerLeave };
}
