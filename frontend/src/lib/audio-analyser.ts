export interface AudioBands {
  bass: number;
  mid: number;
  treble: number;
  intensity: number;
}

interface AnalyserContext<TAnalyser> {
  createAnalyser: () => TAnalyser;
}

export function createAnalyser<
  TAnalyser extends { fftSize: number; smoothingTimeConstant: number },
>(context: AnalyserContext<TAnalyser>): TAnalyser {
  const analyser = context.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.78;
  return analyser;
}

function averageRange(data: Uint8Array, start: number, end: number): number {
  const safeStart = Math.max(0, Math.min(data.length - 1, start));
  const safeEnd = Math.max(safeStart + 1, Math.min(data.length, end));
  let sum = 0;
  for (let index = safeStart; index < safeEnd; index += 1) sum += data[index];
  return sum / (safeEnd - safeStart) / 255;
}

export function calculateAudioBands(
  data: Uint8Array,
  sampleRate: number,
  fftSize = 256,
): AudioBands {
  const binHz = sampleRate / fftSize;
  const bin = (frequency: number) => Math.round(frequency / binHz);
  return {
    bass: averageRange(data, bin(20), bin(250)),
    mid: averageRange(data, bin(250), bin(2_000)),
    treble: averageRange(data, bin(2_000), bin(8_000)),
    intensity: averageRange(data, 0, data.length),
  };
}
