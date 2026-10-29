import { describe, expect, it } from 'vitest';
import { lineBreaks, parseMarkedText, parsePresetTopics, presetEntriesToAdd, TASK1_PREFIX } from './presets';
import { getPresetTopics, getTask1Figure, getTask1Topics, getToeflPrompt, getToeflTopics } from './presetLibrary';
import type { Entry } from '../types';
import band6Task1Raw from '../data/band6/task1Topics.txt?raw';
import band6Task2Raw from '../data/band6/task2Topics.txt?raw';

const band6Figures = import.meta.glob<string>('../data/band6/task1Figures/*.svg', { query: '?raw', import: 'default', eager: true });

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

describe('Task 1 topics', () => {
  it('bundles 12 model answers, two for each chart type, each with a figure', () => {
    const topics = getTask1Topics();
    expect(topics).toHaveLength(12);
    expect(topics.every((t) => t.presetId.startsWith('task1-'))).toBe(true);
    expect(topics.every((t) => t.text.includes('Overall, it is clear that'))).toBe(true);
    expect(topics.every((t) => getTask1Figure(t.presetId)?.startsWith('<svg'))).toBe(true);
  });

  it('keeps numbers out of the overview paragraph', () => {
    for (const t of getTask1Topics()) {
      const overview = t.text.split(/\n\s*\n/)[1]!;
      expect(overview.startsWith('Overall'), t.title).toBe(true);
      expect(/\d/.test(overview), t.title).toBe(false);
    }
  });

  it('follows the Looking first at / Turning to paragraphs', () => {
    for (const t of getTask1Topics()) {
      const paras = t.text.split(/\n\s*\n/);
      expect(paras, t.title).toHaveLength(4);
      expect(paras[2]!.startsWith('Looking first at'), t.title).toBe(true);
      expect(paras[3]!.startsWith('Turning to'), t.title).toBe(true);
    }
  });

  it('adds Task 1 topics into the given tab', () => {
    const { entries } = presetEntriesToAdd(getTask1Topics(), [], new Date(), 'ielts-task1');
    expect(entries.every((e) => e.deckId === 'ielts-task1')).toBe(true);
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

describe('lineBreaks', () => {
  it('marks paragraph breaks and plain line breaks, but not the end of the text', () => {
    expect(lineBreaks('One {{two}}.\n\nThree four.\nFive.')).toEqual(
      new Map([
        [2, true],
        [5, false],
      ]),
    );
  });

  it('finds the four Task 1 paragraphs', () => {
    for (const t of getTask1Topics()) {
      expect([...lineBreaks(t.text).values()], t.title).toEqual([true, true, true]);
    }
  });
});

describe('TOEFL email topics', () => {
  it('bundles 10 emails, each with a prompt of three requirements', () => {
    const topics = getToeflTopics();
    expect(topics).toHaveLength(10);
    for (const t of topics) {
      const prompt = getToeflPrompt(t.presetId);
      expect(prompt?.requirements, t.title).toHaveLength(3);
      expect(prompt?.headers[0], t.title).toMatch(/^To:/);
    }
  });

  it('follows the email template from greeting to sign-off', () => {
    for (const t of getToeflTopics()) {
      expect(t.text, t.title).toMatch(/^Dear .+,\n\nHello, I hope you are doing well\. I am writing /);
      expect(t.text.endsWith('Best regards,\nMisaki'), t.title).toBe(true);
    }
  });
});

describe('band 6 model answers for the everyone build', () => {
  const task1 = parsePresetTopics(band6Task1Raw, TASK1_PREFIX);
  const task2 = parsePresetTopics(band6Task2Raw);

  it('rewrites the same topics under the same titles', () => {
    expect(task2.map((t) => t.title)).toEqual(getPresetTopics().map((t) => t.title));
  });

  it('keeps the same Task 1 chart types, with its own figures', () => {
    const chartType = (title: string) => title.split('｜')[0];
    expect(task1.map((t) => chartType(t.title))).toEqual(getTask1Topics().map((t) => chartType(t.title)));
    for (const t of task1) {
      const figure = band6Figures[`../data/band6/task1Figures/${t.presetId.slice(TASK1_PREFIX.length)}.svg`];
      expect(figure?.startsWith('<svg'), t.title).toBe(true);
      expect(figure, t.title).not.toBe(getTask1Figure(t.presetId));
    }
  });

  it('keeps the Task 1 template and the number-free overview', () => {
    for (const t of task1) {
      const paras = t.text.split(/\n\s*\n/);
      expect(paras, t.title).toHaveLength(4);
      expect(paras[1]!.startsWith('Overall, it is clear that'), t.title).toBe(true);
      expect(/\d/.test(paras[1]!), t.title).toBe(false);
      expect(paras[2]!.startsWith('Looking first at'), t.title).toBe(true);
      expect(paras[3]!.startsWith('Turning to'), t.title).toBe(true);
    }
  });

  it('keeps the Task 2 template', () => {
    for (const t of task2) {
      expect(t.text, t.title).toMatch(/^Some might claim that .+ A good example of this can be observed in Japan/s);
      expect(t.text, t.title).toMatch(/\n\nHowever, (others assert that|opponents) .+ Firstly, .+ For instance, .+ Secondly, /s);
    }
  });
});
