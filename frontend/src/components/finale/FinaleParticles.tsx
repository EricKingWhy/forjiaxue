"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, PointsMaterial } from "three";

import { getPhotos, resolveApiUrl } from "@/lib/api-client";
import { createHeartTargets, parseParticleMap } from "@/lib/particle-utils";
import { createRoseTargets, createScatterOrigins, finaleStageAt, type FinaleStage } from "@/lib/finale-particles";
import { SceneErrorBoundary } from "@/components/ui/SceneErrorBoundary";

const PARTICLE_COUNT = 1800;

function fitParticleMap(text: string): Float32Array | null {
  const map = parseParticleMap(text);
  if (!map.length) return null;
  const output = new Float32Array(PARTICLE_COUNT * 3);
  let extent = 1;
  for (const point of map) extent = Math.max(extent, Math.abs(point.x), Math.abs(point.y));
  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const point = map[Math.floor((index / PARTICLE_COUNT) * map.length)];
    output.set([(point.x / extent) * 3.5, (point.y / extent) * 3.5, 0], index * 3);
  }
  return output;
}

function ease(value: number): number {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function FinaleCloud({ portraitTargets, onStage }: { portraitTargets: Float32Array; onStage: (stage: FinaleStage) => void }) {
  const geometry = useMemo(() => new BufferGeometry(), []);
  const material = useMemo(() => new PointsMaterial({
    size: 0.045,
    color: new Color("#e7a6a7"),
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  }), []);
  const rose = useMemo(() => createRoseTargets(PARTICLE_COUNT), []);
  const origins = useMemo(() => createScatterOrigins(PARTICLE_COUNT), []);
  const positions = useMemo(() => new Float32Array(origins), [origins]);
  const startedAt = useRef<number | null>(null);
  const lastStage = useRef<FinaleStage>("gathering");

  useEffect(() => {
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    return () => { geometry.dispose(); material.dispose(); };
  }, [geometry, material, positions]);

  // Three.js animation state is intentionally mutable inside the render loop.
  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    const elapsed = (clock.elapsedTime - startedAt.current) * 1000;
    const stage = finaleStageAt(elapsed);
    if (stage !== lastStage.current) {
      lastStage.current = stage;
      onStage(stage);
    }
    let from = origins;
    let to = rose;
    let progress = ease(elapsed / 2200);
    if (stage === "rose") progress = 1;
    if (stage === "shattering") {
      from = rose;
      to = origins;
      progress = ease((elapsed - 5000) / 1200);
    }
    if (stage === "portrait") {
      from = origins;
      to = portraitTargets;
      progress = ease((elapsed - 6200) / 2400);
    }
    for (let index = 0; index < positions.length; index += 1) {
      positions[index] = from[index] + (to[index] - from[index]) * progress;
    }
    const attribute = geometry.getAttribute("position") as BufferAttribute;
    attribute.needsUpdate = true;
    material.opacity = stage === "shattering" ? 0.55 : 0.78;
  });
  /* eslint-enable react-hooks/immutability */

  return <points geometry={geometry} material={material} />;
}

export function FinaleParticles({ onStage }: { onStage: (stage: FinaleStage) => void }) {
  const [portraitTargets, setPortraitTargets] = useState(() => createHeartTargets(PARTICLE_COUNT));

  useEffect(() => {
    let cancelled = false;
    getPhotos()
      .then((photos) => photos.main_photo?.particle_map_url
        ? fetch(resolveApiUrl(photos.main_photo.particle_map_url))
        : null)
      .then((response) => response?.ok ? response.text() : null)
      .then((text) => {
        const targets = text ? fitParticleMap(text) : null;
        if (!cancelled && targets) setPortraitTargets(targets);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  return (
    <SceneErrorBoundary><Canvas aria-label="玫瑰化作回忆照片的粒子动画" camera={{ position: [0, 0, 9], fov: 48 }} dpr={[1, 1.5]}>
      <color attach="background" args={["#090308"]} />
      <FinaleCloud portraitTargets={portraitTargets} onStage={onStage} />
    </Canvas></SceneErrorBoundary>
  );
}
