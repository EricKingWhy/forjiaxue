"use client";

import { useCallback, useState, type PointerEvent } from "react";

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

export function usePointerPosition() {
  const [pointer, setPointer] = useState<NormalizedPointer>({ x: 10, y: 10 });
  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    setPointer(normalizePointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect()));
  }, []);
  const onPointerLeave = useCallback(() => setPointer({ x: 10, y: 10 }), []);
  return { pointer, onPointerMove, onPointerLeave };
}
