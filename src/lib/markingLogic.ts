import type { MarkingRange } from '../types';

export interface TapResult {
  ranges: MarkingRange[];
  pendingStart: number | null;
}

export function handleTokenTap(
  ranges: MarkingRange[],
  pendingStart: number | null,
  tapped: number,
): TapResult {
  if (pendingStart === null) {
    const covering = ranges.find((r) => tapped >= r.start && tapped <= r.end);
    if (covering) {
      return { ranges: ranges.filter((r) => r !== covering), pendingStart: null };
    }
    return { ranges, pendingStart: tapped };
  }

  const start = Math.min(pendingStart, tapped);
  const end = Math.max(pendingStart, tapped);

  const kept = ranges.filter((r) => r.end < start || r.start > end);
  const next = [...kept, { start, end }].sort((a, b) => a.start - b.start);

  return { ranges: next, pendingStart: null };
}
