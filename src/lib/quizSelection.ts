import { isWordToken } from './tokenize';
import type { MarkingRange, QuizMode } from '../types';

export function quizCount(n: number, ratio: number): number {
  if (n === 0) return 0;
  return Math.min(n, Math.max(1, Math.round(n * ratio)));
}

export function allWordRanges(tokens: string[]): MarkingRange[] {
  const result: MarkingRange[] = [];
  tokens.forEach((token, i) => {
    if (isWordToken(token)) result.push({ start: i, end: i });
  });
  return result;
}

export function expandToWordRanges(tokens: string[], ranges: MarkingRange[]): MarkingRange[] {
  const indices = new Set<number>();
  for (const r of ranges) {
    for (let i = r.start; i <= r.end; i++) {
      if (i < tokens.length && isWordToken(tokens[i]!)) indices.add(i);
    }
  }
  return [...indices].sort((a, b) => a - b).map((i) => ({ start: i, end: i }));
}

export function quizCandidates(tokens: string[], ranges: MarkingRange[], mode: QuizMode): MarkingRange[] {
  return mode === 'allWords' ? allWordRanges(tokens) : expandToWordRanges(tokens, ranges);
}

export function pickQuizRanges(
  ranges: MarkingRange[],
  ratio: number,
  rng: () => number = Math.random,
): MarkingRange[] {
  const n = ranges.length;
  if (n === 0) return [];

  const k = quizCount(n, ratio);

  const pool = [...ranges];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }

  return pool.slice(0, k).sort((a, b) => a.start - b.start);
}

/** 固定した穴を必ず含めつつ、全体が ratio になるよう残りをランダムに選ぶ */
export function pickBlanks(
  candidates: MarkingRange[],
  pinned: number[],
  ratio: number,
  rng: () => number = Math.random,
): MarkingRange[] {
  const pinnedSet = new Set(pinned);
  const others = candidates.filter((r) => !pinnedSet.has(r.start));
  const total = blankCount(candidates, pinned, ratio);
  const randomPart = shuffle(others, rng).slice(0, Math.max(0, total - pinnedSet.size));
  return [...[...pinnedSet].map((i) => ({ start: i, end: i })), ...randomPart].sort((a, b) => a.start - b.start);
}

export function blankCount(candidates: MarkingRange[], pinned: number[], ratio: number): number {
  const pinnedSet = new Set(pinned);
  const poolSize = candidates.filter((r) => !pinnedSet.has(r.start)).length + pinnedSet.size;
  return Math.max(quizCount(poolSize, ratio), pinnedSet.size);
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  return pool;
}

const AUTO_SKIP_WORDS = new Set([
  // 冠詞
  'a', 'an', 'the',
  // be動詞
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  // 等位接続詞
  'and',
]);

/** 自動の穴埋めでは避ける語(冠詞・be動詞・and) */
export function isAutoSkipWord(token: string): boolean {
  return AUTO_SKIP_WORDS.has(token.toLowerCase());
}

/**
 * 出題候補を作る。割合が100%未満のときは冠詞・be動詞・and を自動の穴にしない。
 * 手動で固定した穴はこれらの語でも残す。
 */
export function blankCandidates(
  tokens: string[],
  ranges: MarkingRange[],
  mode: QuizMode,
  pinned: number[],
  ratio: number,
): MarkingRange[] {
  const candidates = quizCandidates(tokens, ranges, mode);
  if (ratio >= 1) return candidates;
  const pinnedSet = new Set(pinned);
  return candidates.filter(
    (r) => pinnedSet.has(r.start) || r.start !== r.end || !isAutoSkipWord(tokens[r.start] ?? ''),
  );
}
