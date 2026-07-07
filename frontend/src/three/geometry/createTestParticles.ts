import { BufferAttribute, BufferGeometry } from "three";

export function createTestParticles(
  random: () => number = Math.random,
  count = 1000,
): BufferGeometry {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < positions.length; index += 1) {
    positions[index] = (random() - 0.5) * 10;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return geometry;
}
