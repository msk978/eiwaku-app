import { describe, expect, it } from 'vitest';
import { parsePresetTopics, presetEntriesToAdd } from './presets';
import { PRESET_TOPICS } from './presetLibrary';
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
    expect(PRESET_TOPICS).toHaveLength(29);
    expect(PRESET_TOPICS[0]!.title).toBe('1. Higher Education vs. Vocational Training');
    expect(PRESET_TOPICS[28]!.title).toBe('29. Pressure on Young People to Succeed');
    expect(PRESET_TOPICS.every((t) => t.text.startsWith('Some might claim'))).toBe(true);
  });
});

describe('presetEntriesToAdd', () => {
  it('skips topics that were already added', () => {
    const topics = parsePresetTopics('**1. A**\nOne.\n**2. B**\nTwo.\n');
    const existing: Entry[] = [{ id: 'x', createdAt: '', tokens: [], presetId: 'topic-1' }];
    const added = presetEntriesToAdd(topics, existing);
    expect(added.map((e) => e.presetId)).toEqual(['topic-2']);
    expect(added[0]!.tokens).toEqual(['Two', '.']);
  });
});
