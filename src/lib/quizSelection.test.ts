import { describe, expect, it } from 'vitest';
import { pickQuizRanges } from './quizSelection';
import type { MarkingRange } from '../types';

describe('pickQuizRanges', () => {
  it('returns an empty array when there are no markings', () => {
    expect(pickQuizRanges([], 0.5)).toEqual([]);
  });

  it('returns an empty array when there are no markings even at ratio 1', () => {
    expect(pickQuizRanges([], 1)).toEqual([]);
  });

  it('always selects at least one range when ratio rounds to zero', () => {
    const ranges: MarkingRange[] = [{ start: 0, end: 0 }, { start: 1, end: 1 }];
    const result = pickQuizRanges(ranges, 0.1, () => 0);
    expect(result).toHaveLength(1);
  });

  it('never selects more than the total number of markings', () => {
    const ranges: MarkingRange[] = [{ start: 0, end: 0 }];
    const result = pickQuizRanges(ranges, 1, () => 0.9);
    expect(result).toHaveLength(1);
  });

  it('selects the single available range when n=1 regardless of ratio', () => {
    const ranges: MarkingRange[] = [{ start: 3, end: 5 }];
    expect(pickQuizRanges(ranges, 0.01, () => 0)).toEqual([{ start: 3, end: 5 }]);
  });

  it('produces a deterministic selection with an injected rng', () => {
    const ranges: MarkingRange[] = [
      { start: 0, end: 0 },
      { start: 1, end: 1 },
      { start: 2, end: 2 },
      { start: 3, end: 3 },
    ];
    const rng = () => 0;
    const result = pickQuizRanges(ranges, 0.5, rng);
    expect(result).toHaveLength(2);
  });

  it('never returns duplicate ranges', () => {
    const ranges: MarkingRange[] = [
      { start: 0, end: 0 },
      { start: 1, end: 1 },
      { start: 2, end: 2 },
    ];
    const result = pickQuizRanges(ranges, 1, Math.random);
    const starts = result.map((r) => r.start);
    expect(new Set(starts).size).toBe(starts.length);
  });

  it('sorts the selection by appearance order in the text', () => {
    const ranges: MarkingRange[] = [
      { start: 0, end: 0 },
      { start: 5, end: 5 },
      { start: 10, end: 10 },
    ];
    const result = pickQuizRanges(ranges, 1, Math.random);
    const starts = result.map((r) => r.start);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });
});
