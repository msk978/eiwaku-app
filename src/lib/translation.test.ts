import { describe, expect, it } from 'vitest';
import { getPresetTopics, getPresetTranslations } from './presetLibrary';
import { parseMarkedText, presetEntriesToAdd } from './presets';
import { buildEntryTranslation, parseJpLine, sentenceIndices } from './translation';

describe('parseJpLine', () => {
  it('numbers the marked parts in order, with continuations and explicit numbers', () => {
    expect(parseJpLine('A【x】B【+y】C【z】')).toEqual([
      { text: 'A' },
      { text: 'x', expr: 0 },
      { text: 'B' },
      { text: 'y', expr: 0 },
      { text: 'C' },
      { text: 'z', expr: 1 },
    ]);
    expect(parseJpLine('【2:後】と【1:先】').map((s) => s.expr)).toEqual([1, undefined, 0]);
  });
});

describe('bundled translations', () => {
  const topics = getPresetTopics();
  const translations = getPresetTranslations();

  it('has one line per English sentence and matches the expressions sentence by sentence', () => {
    for (const topic of topics) {
      const lines = translations.get(topic.presetId)!;
      const { tokens, expressions } = parseMarkedText(topic.text);
      const sentenceOf = sentenceIndices(tokens);
      expect(lines, topic.title).toHaveLength(sentenceOf[sentenceOf.length - 1]! + 1);
      lines.forEach((line, s) => {
        const enCount = expressions.filter((e) => sentenceOf[e[0]!] === s).length;
        const jp = parseJpLine(line).flatMap((seg) => (seg.expr === undefined ? [] : [seg.expr]));
        // 【 】の数と番号が、その英文の表現にちょうど対応している
        expect([...new Set(jp)].sort(), `${topic.title} / ${s + 1}: ${line}`).toEqual(
          [...Array(enCount).keys()],
        );
      });
    }
  });

  it('links a freshly added preset entry to its translation', () => {
    const { entries } = presetEntriesToAdd(topics, []);
    for (const entry of entries) {
      const t = buildEntryTranslation(entry, topics, translations);
      expect(t, entry.title).not.toBeNull();
      // 表現の語はすべて、和訳のどこかの部分に対応している
      const jpExprs = new Set(t!.sentences.flat().flatMap((seg) => (seg.expr === undefined ? [] : [seg.expr])));
      for (const e of t!.exprOfToken.values()) expect(jpExprs.has(e)).toBe(true);
    }
  });

  it('gives up when the entry text no longer matches the bundled text', () => {
    const { entries } = presetEntriesToAdd(topics.slice(0, 1), []);
    const edited = { ...entries[0]!, tokens: entries[0]!.tokens.slice(1) };
    expect(buildEntryTranslation(edited, topics, translations)).toBeNull();
  });
});
