"use client";

import { Sparkles } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getPhotos } from "@/lib/api-client";
import { useWallRotation } from "@/hooks/useWallRotation";
import { createCylindricalLayout } from "@/three/photo-wall/layout";
import type { PhotoResponse } from "@/types";
import { useConfigStore, usePhotoWallStore } from "@/stores";

import { PhotoCard } from "./PhotoCard";

class PhotoMediaBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function PhotoRing({ photos }: { photos: PhotoResponse[] }) {
  const layout = useMemo(() => createCylindricalLayout(photos.length, 5), [photos.length]);
  const groupRef = useWallRotation();
  const selectPhoto = usePhotoWallStore((state) => state.selectPhoto);
  return (
    <group ref={groupRef}>
      {photos.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} {...layout[index]} onSelect={selectPhoto} />
      ))}
    </group>
  );
}

export function PhotoWallCanvas() {
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMediaError, setHasMediaError] = useState(false);
  const tier = useConfigStore((state) => state.particle_tier);
  const visiblePhotos = useMemo(
    () => photos.slice(0, tier === "low" ? 6 : tier === "medium" ? 10 : photos.length),
    [photos, tier],
  );

  useEffect(() => {
    let cancelled = false;
    getPhotos()
      .then((response) => {
        if (!cancelled) setPhotos(response.wall_photos);
      })
      .catch(() => {
        if (!cancelled) setPhotos([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative h-full w-full touch-pan-y">
      <Canvas aria-label="我们的照片回忆" camera={{ position: [0, 0, 0.1], fov: 58 }}>
        <color attach="background" args={["#070308"]} />
        <ambientLight intensity={0.55} color="#f7d8dc" />
        {tier !== "low" && (
          <pointLight position={[0, 3, 0]} intensity={8} color="#d7a36f" distance={12} />
        )}
        <Sparkles count={tier === "low" ? 30 : 80} scale={[8, 5, 8]} size={1.2} speed={0.12} color="#e9b7c0" />
        <PhotoMediaBoundary onError={() => setHasMediaError(true)}>
          <Suspense fallback={null}>{visiblePhotos.length > 0 && <PhotoRing photos={visiblePhotos} />}</Suspense>
        </PhotoMediaBoundary>
      </Canvas>
      {(isLoading || photos.length === 0 || hasMediaError) && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xs tracking-[0.5em] text-rose-200/45">OUR MEMORIES</p>
            <p className="mt-4 text-base font-light tracking-[0.18em] text-rose-50/70">
              {isLoading ? "正在拾起我们的光影" : "回忆正在等待被珍藏"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
