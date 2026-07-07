import { BufferAttribute, BufferGeometry } from "three";

export interface ParticleGeometryOptions {
  count: number;
  random?: () => number;
  targetPositions?: Float32Array;
  colors?: Float32Array;
}

export function createParticleGeometry({
  count,
  random = Math.random,
  targetPositions,
  colors: suppliedColors,
}: ParticleGeometryOptions): BufferGeometry {
  const positions = new Float32Array(count * 3);
  const colors = suppliedColors ?? new Float32Array(count * 3);
  if (colors.length !== count * 3) {
    throw new Error("colors length must equal count * 3");
  }
  const sizes = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (random() - 0.5) * 11;
    positions[index * 3 + 1] = (random() - 0.5) * 8;
    positions[index * 3 + 2] = (random() - 0.5) * 5;
    if (!suppliedColors) {
      const warmth = random();
      colors[index * 3] = 0.72 + warmth * 0.28;
      colors[index * 3 + 1] = 0.25 + warmth * 0.5;
      colors[index * 3 + 2] = 0.38 + warmth * 0.42;
    }
  }
  for (let index = 0; index < sizes.length; index += 1) {
    sizes[index] = 0.45 + random() * 0.65;
  }

  const geometry = new BufferGeometry();
  const targets = targetPositions ?? positions.slice();
  if (targets.length !== count * 3) {
    throw new Error("targetPositions length must equal count * 3");
  }
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("initialPosition", new BufferAttribute(positions.slice(), 3));
  geometry.setAttribute("targetPosition", new BufferAttribute(targets, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.setAttribute("size", new BufferAttribute(sizes, 1));
  return geometry;
}
