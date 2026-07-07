"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";

export function rotationFromDrag(delta: number, sensitivity = 0.005): number {
  return Math.max(-1.2, Math.min(1.2, delta * sensitivity));
}

export function useWallRotation() {
  const groupRef = useRef<Group>(null);
  const target = useRef(0);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  useEffect(() => {
    const element = gl.domElement;
    const down = (event: PointerEvent) => {
      dragging.current = true;
      last.current = { x: event.clientX, y: event.clientY };
      element.setPointerCapture?.(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - last.current.x;
      const dy = event.clientY - last.current.y;
      if (Math.abs(dx) > Math.abs(dy)) target.current += rotationFromDrag(dx);
      last.current = { x: event.clientX, y: event.clientY };
    };
    const up = () => {
      dragging.current = false;
    };
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        target.current += rotationFromDrag(event.deltaX, 0.0025);
      }
    };
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("wheel", wheel, { passive: true });
    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("wheel", wheel);
    };
  }, [gl]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const factor = 1 - Math.exp(-delta * 7);
    groupRef.current.rotation.y += (target.current - groupRef.current.rotation.y) * factor;
  });

  return groupRef;
}
