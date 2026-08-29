import { describe, expect, it } from 'vitest';
import { tokenize } from './tokenize';

describe('tokenize', () => {
  it('splits plain words on spaces', () => {
    expect(tokenize('hello world')).toEqual(['hello', 'world']);
  });

  it('separates punctuation from the preceding word', () => {
    expect(tokenize('market, companies.')).toEqual(['market', ',', 'companies', '.']);
  });

  it('keeps contractions as a single token', () => {
    expect(tokenize("don't stop it's fine")).toEqual(["don't", 'stop', "it's", 'fine']);
  });

  it('keeps hyphenated compounds as a single token', () => {
    expect(tokenize('a well-known fact')).toEqual(['a', 'well-known', 'fact']);
  });

  it('splits an ellipsis into three separate period tokens', () => {
    expect(tokenize('wait...')).toEqual(['wait', '.', '.', '.']);
  });

  it('splits an em dash out as its own token', () => {
    expect(tokenize('wait—no')).toEqual(['wait', '—', 'no']);
  });

  it('keeps digits and separates comma-grouped numbers', () => {
    expect(tokenize('1,000 dollars')).toEqual(['1', ',', '000', 'dollars']);
  });

  it('returns an empty array for an empty string', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('discards newlines and repeated whitespace', () => {
    expect(tokenize('line one\n\nline   two')).toEqual(['line', 'one', 'line', 'two']);
  });
});
