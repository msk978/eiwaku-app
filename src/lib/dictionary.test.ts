import { describe, expect, it } from 'vitest';
import { lookupCandidates, lookupGloss, parseDictionary, shortGloss } from './dictionary';

describe('shortGloss', () => {
  it('prefers the first emphasized sense', () => {
    expect(shortGloss('〈物〉を『ずっと持っている』,保持する / 〈物〉を『保存しておく』')).toBe('ずっと持っている');
  });

  it('falls back to the first plain item without grammar markers', () => {
    expect(shortGloss('〈U〉兵法,用兵学 / 〈C〉戦略,戦術')).toBe('兵法');
  });

  it('keeps only the first item of an emphasized list and drops bracketed notes', () => {
    expect(shortGloss('『あれ,それ,』 / ...')).toBe('あれ');
    expect(shortGloss('『きょう[は]』')).toBe('きょう');
  });

  it('ignores emphasized words inside parenthetical notes', () => {
    expect(shortGloss('(また《話》『have got』)〈物〉を『持っている』')).toBe('持っている');
  });

  it('truncates long glosses', () => {
    expect(shortGloss('『あいうえおかきくけこさしすせそたち』')).toBe('あいうえおかきくけこさしすせ…');
  });
});

describe('lookupCandidates', () => {
  it('guesses base forms of inflected words', () => {
    expect(lookupCandidates('strategies')).toContain('strategy');
    expect(lookupCandidates('changing')).toContain('change');
    expect(lookupCandidates('stopped')).toContain('stop');
    expect(lookupCandidates("today's")[0]).toBe('today');
  });
});

describe('lookupGloss', () => {
  const dict = parseDictionary('keep\t〈物〉を『ずっと持っている』\nstrategy\t〈C〉戦略,戦術\nA,a\t〈C〉英語アルファベットの第1字\n');

  it('finds glosses case-insensitively and through inflections', () => {
    expect(lookupGloss(dict, 'Keep')).toBe('ずっと持っている');
    expect(lookupGloss(dict, 'strategies')).toBe('戦略');
    expect(lookupGloss(dict, 'a')).toBe('英語アルファベットの第1字');
  });

  it('prefers lowercase headwords over abbreviations', () => {
    const d = parseDictionary('IN\tIndiana\nIn\tindiumの化学記号\nin\t《場所》 / …『の中に』\n');
    expect(lookupGloss(d, 'In')).toBe('の中に');
  });

  it('returns undefined for unknown words', () => {
    expect(lookupGloss(dict, 'zzzz')).toBeUndefined();
  });
});
