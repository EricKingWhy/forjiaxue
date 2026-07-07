"use client";

import { RoundedBox, useTexture } from "@react-three/drei";

import { resolveApiUrl } from "@/lib/api-client";
import type { PhotoResponse } from "@/types";
import type { PhotoWallTransform } from "@/three/photo-wall/layout";

interface PhotoCardProps extends PhotoWallTransform {
  photo: PhotoResponse;
  onSelect: (photo: PhotoResponse) => void;
}

export function PhotoCard({ photo, position, rotationY, onSelect }: PhotoCardProps) {
  const texture = useTexture(resolveApiUrl(photo.thumbnail_url ?? photo.webp_url));

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RoundedBox
        args={[2.7, 1.8, 0.08]}
        radius={0.08}
        smoothness={4}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(photo);
        }}
        onPointerEnter={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "default";
        }}
      >
        <meshStandardMaterial map={texture} roughness={0.42} metalness={0.06} />
      </RoundedBox>
    </group>
  );
}
