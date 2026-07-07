export function splitGraphemes(text: string): string[] {
  if (typeof Intl.Segmenter === "function") {
    return [...new Intl.Segmenter("zh", { granularity: "grapheme" }).segment(text)]
      .map(({ segment }) => segment);
  }
  return Array.from(text);
}
