import { describe, expect, it } from 'vitest';
import { accuracyRate, sessionsForEntry, studyCount } from './stats';
import type { SessionRecord } from '../types';

describe('accuracyRate', () => {
  it('returns null when there are no sessions', () => {
    expect(accuracyRate([])).toBeNull();
  });

  it('computes a weighted accuracy across multiple sessions', () => {
    const sessions: SessionRecord[] = [
      { id: 's1', entryId: 'e1', timestamp: 't1', totalQuestions: 4, correctCount: 2 },
      { id: 's2', entryId: 'e1', timestamp: 't2', totalQuestions: 6, correctCount: 6 },
    ];
    expect(accuracyRate(sessions)).toBeCloseTo(0.8);
  });
});

describe('studyCount', () => {
  it('counts the number of sessions', () => {
    const sessions: SessionRecord[] = [
      { id: 's1', entryId: 'e1', timestamp: 't1', totalQuestions: 1, correctCount: 1 },
    ];
    expect(studyCount(sessions)).toBe(1);
  });
});

describe('sessionsForEntry', () => {
  it('filters to the given entry and sorts by timestamp', () => {
    const sessions: SessionRecord[] = [
      { id: 's2', entryId: 'e1', timestamp: '2026-01-02', totalQuestions: 1, correctCount: 1 },
      { id: 's-other', entryId: 'e2', timestamp: '2026-01-01', totalQuestions: 1, correctCount: 0 },
      { id: 's1', entryId: 'e1', timestamp: '2026-01-01', totalQuestions: 1, correctCount: 0 },
    ];
    expect(sessionsForEntry(sessions, 'e1').map((s) => s.id)).toEqual(['s1', 's2']);
  });
});
