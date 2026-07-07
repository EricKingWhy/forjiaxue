export interface PixelParticle {
  x: number;
  y: number;
  color: [number, number, number];
}

type PixelSource = Pick<ImageData, "width" | "height" | "data">;

export function sampleImagePixels(
  image: PixelSource,
  step = 4,
): PixelParticle[] {
  if (!Number.isInteger(step) || step < 1) {
    throw new Error("Particle sample step must be a positive integer");
  }

  const particles: PixelParticle[] = [];
  for (let y = 0; y < image.height; y += step) {
    for (let x = 0; x < image.width; x += step) {
      const offset = (y * image.width + x) * 4;
      if (image.data[offset + 3] === 0) continue;
      particles.push({
        x: x - (image.width - 1) / 2,
        y: (image.height - 1) / 2 - y,
        color: [
          image.data[offset] / 255,
          image.data[offset + 1] / 255,
          image.data[offset + 2] / 255,
        ],
      });
    }
  }
  return particles;
}

export function parseParticleMap(input: string | unknown): PixelParticle[] {
  const value: unknown = typeof input === "string" ? JSON.parse(input) : input;
  if (!Array.isArray(value)) throw new Error("Particle map must be an array");

  return value.map((record) => {
    if (
      typeof record !== "object" ||
      record === null ||
      typeof record.x !== "number" ||
      typeof record.y !== "number" ||
      typeof record.color !== "string" ||
      !/^#[0-9a-f]{6}$/i.test(record.color)
    ) {
      throw new Error("Invalid particle map record");
    }
    const hex = Number.parseInt(record.color.slice(1), 16);
    return {
      x: record.x,
      y: record.y,
      color: [
        ((hex >> 16) & 255) / 255,
        ((hex >> 8) & 255) / 255,
        (hex & 255) / 255,
      ],
    };
  });
}

export function createHeartTargets(
  count: number,
  random: () => number = Math.random,
): Float32Array {
  const positions = new Float32Array(count * 3);
  let index = 0;
  while (index < count) {
    const x = random() * 2.4 - 1.2;
    const y = random() * 2.4 - 1.1;
    const curve = (x * x + y * y - 1) ** 3 - x * x * y ** 3;
    if (curve > 0) continue;
    positions[index * 3] = x * 2.7;
    positions[index * 3 + 1] = y * 2.7 - 0.35;
    positions[index * 3 + 2] = (random() - 0.5) * 0.35;
    index += 1;
  }
  return positions;
}
