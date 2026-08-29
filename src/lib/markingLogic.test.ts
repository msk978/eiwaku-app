import { describe, expect, it } from 'vitest';
import { handleTokenTap } from './markingLogic';

describe('handleTokenTap', () => {
  it('sets pendingStart on the first tap of an unmarked token', () => {
    const result = handleTokenTap([], null, 5);
    expect(result).toEqual({ ranges: [], pendingStart: 5 });
  });

  it('confirms a range spanning start and end tokens', () => {
    const result = handleTokenTap([], 5, 8);
    expect(result).toEqual({ ranges: [{ start: 5, end: 8 }], pendingStart: null });
  });

  it('normalizes the range when the end token is tapped before the start', () => {
    const result = handleTokenTap([], 8, 5);
    expect(result).toEqual({ ranges: [{ start: 5, end: 8 }], pendingStart: null });
  });

  it('confirms a single-word range when the same token is tapped twice', () => {
    const result = handleTokenTap([], 5, 5);
    expect(result).toEqual({ ranges: [{ start: 5, end: 5 }], pendingStart: null });
  });

  it('removes an existing marking on a first-tap re-tap', () => {
    const ranges = [{ start: 2, end: 4 }];
    const result = handleTokenTap(ranges, null, 3);
    expect(result).toEqual({ ranges: [], pendingStart: null });
  });

  it('leaves other markings untouched when removing one', () => {
    const ranges = [{ start: 2, end: 4 }, { start: 10, end: 10 }];
    const result = handleTokenTap(ranges, null, 3);
    expect(result.ranges).toEqual([{ start: 10, end: 10 }]);
  });

  it('overwrites an overlapping existing range entirely rather than trimming it', () => {
    const ranges = [{ start: 2, end: 4 }];
    const result = handleTokenTap(ranges, 3, 6);
    expect(result).toEqual({ ranges: [{ start: 3, end: 6 }], pendingStart: null });
  });

  it('removes multiple overlapping ranges when a new range spans them', () => {
    const ranges = [{ start: 0, end: 1 }, { start: 5, end: 6 }, { start: 9, end: 10 }];
    const result = handleTokenTap(ranges, 1, 9);
    expect(result.ranges).toEqual([{ start: 1, end: 9 }]);
  });

  it('keeps ranges sorted by start position', () => {
    const ranges = [{ start: 10, end: 10 }];
    const result = handleTokenTap(ranges, 0, 2);
    expect(result.ranges).toEqual([{ start: 0, end: 2 }, { start: 10, end: 10 }]);
  });
});
