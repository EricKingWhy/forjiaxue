export interface PhotoWallTransform {
  position: [number, number, number];
  rotationY: number;
}

export function createCylindricalLayout(
  count: number,
  radius = 5,
): PhotoWallTransform[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("Photo count must be a non-negative integer");
  }
  if (radius <= 0) throw new Error("Cylinder radius must be positive");
  if (count === 0) return [];

  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return {
      position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius],
      rotationY: angle + Math.PI,
    };
  });
}
