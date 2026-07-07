"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BufferGeometry, ShaderMaterial } from "three";

import { createParticleGeometry } from "@/three/geometry/ParticleGeometry";
import { createParticleMaterial } from "@/three/particle-engine/ParticleMaterial";
import {
  createBloomComposer,
  type BloomComposer,
} from "@/three/particle-engine/PostProcessing";
import { useProgressAnimation } from "@/hooks/useProgressAnimation";
import {
  usePointerPosition,
  type NormalizedPointer,
} from "@/hooks/usePointerPosition";
import { useScatterReset } from "@/hooks/useScatterReset";
import { usePerformance } from "@/hooks/usePerformance";
import { getParticleCount, shouldEnableBloom } from "@/lib/performance";
import { pointSizeFromBass, scatterFromTreble } from "@/lib/audio-visuals";
import { getPhotos, resolveApiUrl } from "@/lib/api-client";
import {
  createHeartTargets,
  parseParticleMap,
  type PixelParticle,
} from "@/lib/particle-utils";
import { useAudioStore, useConfigStore } from "@/stores";
import { AudioStars } from "./AudioStars";
import { SceneErrorBoundary } from "@/components/ui/SceneErrorBoundary";

function isPointerActive(pointer: NormalizedPointer): boolean {
  return Math.abs(pointer.x) <= 1 && Math.abs(pointer.y) <= 1;
}

/**
 * Scales a parsed particle map (pixel-space, centered) into the world-space
 * range used by the scene (~±4 units) and flattens it to a Float32Array of
 * xyz triplets with z=0.
 */
interface ParticleTargets {
  positions: Float32Array;
  colors: Float32Array;
}

function toParticleTargets(map: PixelParticle[]): ParticleTargets {
  let maxExtent = 1;
  for (const particle of map) {
    const extent = Math.max(Math.abs(particle.x), Math.abs(particle.y));
    if (extent > maxExtent) maxExtent = extent;
  }
  const scale = 4 / maxExtent;
  const positions = new Float32Array(map.length * 3);
  const colors = new Float32Array(map.length * 3);
  for (let index = 0; index < map.length; index += 1) {
    positions[index * 3] = map[index].x * scale;
    positions[index * 3 + 1] = map[index].y * scale;
    positions[index * 3 + 2] = 0;
    colors.set(map[index].color, index * 3);
  }
  return { positions, colors };
}

interface SceneProps {
  particleCount: number;
  enableBloom: boolean;
  pointer: NormalizedPointer;
  isPointerActive: boolean;
  targetPositions: Float32Array | null;
  targetColors?: Float32Array;
}

function ParticleScene({
  particleCount,
  enableBloom,
  pointer,
  isPointerActive,
  targetPositions,
  targetColors,
}: SceneProps) {
  const { gl, scene, camera, size } = useThree();

  const geometry = useMemo<BufferGeometry>(
    () =>
      createParticleGeometry({
        count: particleCount,
        targetPositions: targetPositions ?? undefined,
        colors: targetColors,
      }),
    [particleCount, targetColors, targetPositions],
  );

  const material = useMemo(() => createParticleMaterial(), []);
  const materialRef = useRef<ShaderMaterial | null>(material);

  useProgressAnimation(materialRef, true);
  useScatterReset(materialRef, isPointerActive);

  // Push the latest normalized pointer into the shader uniform.
  useEffect(() => {
    const uniform = materialRef.current?.uniforms.pointer;
    if (uniform) {
      (uniform.value as { set: (x: number, y: number) => void }).set(
        pointer.x,
        pointer.y,
      );
    }
  }, [pointer]);

  // Bloom post-processing composer. When disabled the scene renders directly.
  const bloom = useMemo<BloomComposer | null>(() => {
    if (!enableBloom) return null;
    return createBloomComposer(gl, scene, camera, {
      strength: 0.38,
      radius: 0.22,
      threshold: 0.48,
    });
  }, [enableBloom, gl, scene, camera]);

  useEffect(() => {
    bloom?.setSize(size.width, size.height);
  }, [bloom, size]);

  useEffect(() => () => bloom?.dispose(), [bloom]);
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  // renderPriority=1 disables R3F's automatic render so the composer (or a
  // manual gl.render) owns the frame, matching FR-010/011 and SC-003.
  useFrame((_state, delta) => {
    const audio = useAudioStore.getState();
    const audioUniform = materialRef.current?.uniforms.audioIntensity;
    if (audioUniform) {
      // Shader uniforms are mutable Three.js state updated outside React rendering.
      // eslint-disable-next-line react-hooks/immutability
      audioUniform.value += (audio.intensity - audioUniform.value) * Math.min(1, delta * 8);
    }
    const pointSizeUniform = materialRef.current?.uniforms.pointSize;
    if (pointSizeUniform) {
      const targetSize = pointSizeFromBass(audio.bass);
      pointSizeUniform.value += (targetSize - pointSizeUniform.value) * Math.min(1, delta * 10);
    }
    const scatterUniform = materialRef.current?.uniforms.audioScatter;
    if (scatterUniform) {
      const targetScatter = scatterFromTreble(audio.treble);
      scatterUniform.value += (targetScatter - scatterUniform.value) * Math.min(1, delta * 7);
    }
    if (bloom) {
      bloom.render(delta);
    } else {
      gl.render(scene, camera);
    }
  }, 1);

  return <points geometry={geometry} material={material} />;
}

export function ParticleCanvas({ active = true }: { active?: boolean } = {}) {
  const defaultTier = useConfigStore((state) => state.particle_tier);
  const bloomEnabled = useConfigStore((state) => state.bloom_enabled);
  const { tier } = usePerformance(defaultTier);
  const { pointer, onPointerMove, onPointerLeave } = usePointerPosition();
  const [targetData, setTargetData] = useState<ParticleTargets | null>(null);

  const fallbackCount = getParticleCount(tier);
  const fallbackTargets = useMemo(
    () => createHeartTargets(fallbackCount),
    [fallbackCount],
  );
  const particleCount = targetData
    ? targetData.positions.length / 3
    : fallbackCount;
  const enableBloom = shouldEnableBloom(tier, bloomEnabled);

  // Prefer the admin-uploaded particle map; fall back to procedural random
  // targets so the aggregation animation is always demonstrable (FR-008).
  useEffect(() => {
    let cancelled = false;
    getPhotos()
      .then((response) => {
        const url = response.main_photo?.particle_map_url;
        if (!url) return undefined;
        return fetch(resolveApiUrl(url)).then((res) => {
          if (!res.ok) throw new Error(`Particle map request failed (${res.status})`);
          return res.text();
        });
      })
      .then((text) => {
        if (cancelled || !text) return;
        const map = parseParticleMap(text);
        if (map.length > 0) setTargetData(toParticleTargets(map));
      })
      .catch(() => {
        /* keep procedural fallback targets */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="h-full w-full"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ touchAction: "none" }}
    >
      <SceneErrorBoundary><Canvas
        frameloop={active ? "always" : "never"}
        aria-label="照片粒子场景"
        className="h-full w-full"
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#08020f"]} />
        <AudioStars tier={tier} />
        <ParticleScene
          particleCount={particleCount}
          enableBloom={enableBloom}
          pointer={pointer}
          isPointerActive={isPointerActive(pointer)}
          targetPositions={targetData?.positions ?? fallbackTargets}
          targetColors={targetData?.colors}
        />
      </Canvas></SceneErrorBoundary>
    </div>
  );
}
