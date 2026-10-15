import { describe, expect, it } from 'vitest';
import { parseMarkedText, parsePresetTopics, presetEntriesToAdd } from './presets';
import { getPresetTopics } from './presetLibrary';
import type { Entry } from '../types';

describe('parsePresetTopics', () => {
  it('splits headings and bodies', () => {
    const topics = parsePresetTopics('**1. First**\n\nHello world.\n\nSecond para.\n\n**2. Next Topic**\nBye.\n');
    expect(topics).toEqual([
      { presetId: 'topic-1', title: '1. First', text: 'Hello world.\n\nSecond para.' },
      { presetId: 'topic-2', title: '2. Next Topic', text: 'Bye.' },
    ]);
  });

  it('bundles all 29 topics', () => {
    const topics = getPresetTopics();
    expect(topics).toHaveLength(29);
    expect(topics[0]!.title).toBe('1. Higher Education vs. Vocational Training');
    expect(topics[28]!.title).toBe('29. Pressure on Young People to Succeed');
    expect(topics.every((t) => t.text.startsWith('Some might claim'))).toBe(true);
  });

  it('marks idiomatic expressions in every topic, with balanced braces', () => {
    for (const t of getPresetTopics()) {
      expect(t.text.split('{{').length).toBe(t.text.split('}}').length);
      const { tokens, ranges } = parseMarkedText(t.text);
      expect(ranges.length).toBeGreaterThan(0);
      expect(tokens.some((tok) => tok.includes('{') || tok.includes('}'))).toBe(false);
    }
  });
});

describe('parseMarkedText', () => {
  it('drops the braces and marks each word inside them', () => {
    const { tokens, ranges } = parseMarkedText('It {{goes without saying}}, {{in theory}}.');
    expect(tokens).toEqual(['It', 'goes', 'without', 'saying', ',', 'in', 'theory', '.']);
    expect(ranges).toEqual([
      { start: 1, end: 1 },
      { start: 2, end: 2 },
      { start: 3, end: 3 },
      { start: 5, end: 5 },
      { start: 6, end: 6 },
    ]);
  });

  it('does not mark punctuation inside the braces', () => {
    const { ranges } = parseMarkedText('{{difficult, if not impossible}}');
    expect(ranges.map((r) => r.start)).toEqual([0, 2, 3, 4]);
  });
});

describe('presetEntriesToAdd', () => {
  it('skips topics that were already added', () => {
    const topics = parsePresetTopics('**1. A**\nOne.\n**2. B**\nTwo {{words}}.\n');
    const existing: Entry[] = [{ id: 'x', createdAt: '', tokens: [], presetId: 'topic-1' }];
    const { entries, markings } = presetEntriesToAdd(topics, existing);
    expect(entries.map((e) => e.presetId)).toEqual(['topic-2']);
    expect(entries[0]!.tokens).toEqual(['Two', 'words', '.']);
    expect(markings).toEqual([{ entryId: entries[0]!.id, ranges: [{ start: 1, end: 1 }] }]);
  });
});
