import type { MarkingRange } from '../types';

export function pickQuizRanges(
  ranges: MarkingRange[],
  ratio: number,
  rng: () => number = Math.random,
): MarkingRange[] {
  const n = ranges.length;
  if (n === 0) return [];

  const k = Math.min(n, Math.max(1, Math.round(n * ratio)));

  const pool = [...ranges];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }

  return pool.slice(0, k).sort((a, b) => a.start - b.start);
}
