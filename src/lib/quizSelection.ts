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
  // 接続副詞
  'accordingly', 'additionally', 'also', 'besides', 'consequently', 'conversely',
  'finally', 'first', 'firstly', 'furthermore', 'hence', 'however', 'indeed',
  'instead', 'lastly', 'likewise', 'meanwhile', 'moreover', 'nevertheless',
  'nonetheless', 'otherwise', 'overall', 'second', 'secondly', 'similarly',
  'still', 'subsequently', 'then', 'therefore', 'third', 'thirdly', 'thus',
  // 頻度の副詞
  'always', 'constantly', 'ever', 'frequently', 'generally', 'never', 'normally',
  'occasionally', 'often', 'rarely', 'regularly', 'seldom', 'sometimes',
  'typically', 'usually',
]);

/** 自動の穴埋めでは避ける語(冠詞・be動詞・and・接続副詞・頻度の副詞) */
export function isAutoSkipWord(token: string): boolean {
  return AUTO_SKIP_WORDS.has(token.toLowerCase());
}

export interface BlankOptions {
  /** 必ず穴にするトークン */
  pinned?: number[];
  /** 穴にしないトークン */
  excluded?: number[];
}

/**
 * 出題候補を作る。
 * - 除外した語はどの割合でも候補に入れない。
 * - 「全単語からランダム」で割合が100%未満のときは、冠詞・be動詞・and・
 *   接続副詞・頻度の副詞も候補に入れない。マーキングした語には適用しない。
 * - 手動で固定した語はどちらの場合も候補に残す。
 */
export function blankCandidates(
  tokens: string[],
  ranges: MarkingRange[],
  mode: QuizMode,
  ratio: number,
  options: BlankOptions = {},
): MarkingRange[] {
  const pinnedSet = new Set(options.pinned ?? []);
  const excludedSet = new Set(options.excluded ?? []);
  const skipFunctionWords = ratio < 1 && mode === 'allWords';

  return quizCandidates(tokens, ranges, mode).filter((r) => {
    if (pinnedSet.has(r.start)) return true;
    if (r.start === r.end && excludedSet.has(r.start)) return false;
    if (!skipFunctionWords) return true;
    return r.start !== r.end || !isAutoSkipWord(tokens[r.start] ?? '');
  });
}
