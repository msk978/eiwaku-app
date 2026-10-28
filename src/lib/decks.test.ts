import { describe, expect, it } from 'vitest';
import { DEFAULT_DECKS, deckIdOf } from './decks';
import type { Entry } from '../types';

const entry = (over: Partial<Entry>): Entry => ({ id: 'x', createdAt: '2026-01-01T00:00:00Z', tokens: [], ...over });

describe('deckIdOf', () => {
  it('uses the stored tab when it still exists', () => {
    expect(deckIdOf(entry({ deckId: 'ielts-task1' }), DEFAULT_DECKS)).toBe('ielts-task1');
  });

  it('puts untagged Task 1 presets into the Task 1 tab and everything else into the first tab', () => {
    expect(deckIdOf(entry({ presetId: 'task1-3' }), DEFAULT_DECKS)).toBe('ielts-task1');
    expect(deckIdOf(entry({ presetId: 'topic-3' }), DEFAULT_DECKS)).toBe('ielts-task2');
    expect(deckIdOf(entry({}), DEFAULT_DECKS)).toBe('ielts-task2');
  });

  it('falls back to the first tab when the stored tab was deleted', () => {
    expect(deckIdOf(entry({ deckId: 'gone' }), DEFAULT_DECKS)).toBe('ielts-task2');
  });
});
