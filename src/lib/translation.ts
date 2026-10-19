import { parseMarkedText, type PresetTopic } from './presets';
import type { Entry } from '../types';

/**
 * 内蔵題材の全文和訳。英文1文につき和訳1行で、【 】で囲んだ部分が
 * 英文の {{ }} の表現に順に対応する。【2:…】は対応する表現の番号を指定、【+…】は直前の部分の続き。
 */

export type JpSegment = { text: string; expr?: number };

/** 和訳1行を、表現に対応する部分(expr はその文の中での表現の番号、0始まり)とそれ以外に分ける */
export function parseJpLine(line: string): JpSegment[] {
  const segments: JpSegment[] = [];
  let count = 0;
  let last: number | undefined;
  for (const part of line.split(/(【.*?】)/)) {
    if (!part) continue;
    if (!part.startsWith('【')) {
      segments.push({ text: part });
      continue;
    }
    const m = /^【(\+|(\d+):)?(.*)】$/s.exec(part)!;
    let expr: number;
    if (m[1] === '+' && last !== undefined) expr = last;
    else if (m[2]) {
      expr = Number(m[2]) - 1;
      count++;
    } else expr = count++;
    last = expr;
    segments.push({ text: m[3]!, expr });
  }
  return segments;
}

/** 和訳の中で数えた表現の数(続きの部分は数えない) */
export function jpExpressionCount(line: string): number {
  return new Set(parseJpLine(line).flatMap((s) => (s.expr === undefined ? [] : [s.expr]))).size;
}

/** 「**番号**」の見出しと、1文1行の和訳が並んだテキストを読む。キーは presetId */
export function parseTranslations(raw: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  let current: string[] | null = null;
  for (const line of raw.split(/\r?\n/)) {
    const heading = /^\*\*(\d+)\*\*\s*$/.exec(line);
    if (heading) {
      current = [];
      map.set(`topic-${heading[1]}`, current);
    } else if (current && line.trim()) {
      current.push(line.trim());
    }
  }
  return map;
}

/** トークンごとの文番号(. ? ! で文が終わる) */
export function sentenceIndices(tokens: string[]): number[] {
  let s = 0;
  return tokens.map((t) => {
    const index = s;
    if (/^[.?!]$/.test(t)) s++;
    return index;
  });
}

export interface EntryTranslation {
  /** 文ごとの和訳。expr は本文全体での表現の番号 */
  sentences: JpSegment[][];
  /** 各文の最後のトークンのインデックス */
  sentenceEnds: number[];
  /** トークンインデックス → 本文全体での表現の番号 */
  exprOfToken: Map<number, number>;
}

/** 内蔵題材から追加した英文なら、その全文和訳を英文のトークンに対応づける。対応できなければ null */
export function buildEntryTranslation(
  entry: Entry,
  topics: PresetTopic[],
  translations: Map<string, string[]>,
): EntryTranslation | null {
  if (!entry.presetId) return null;
  const topic = topics.find((t) => t.presetId === entry.presetId);
  const lines = translations.get(entry.presetId);
  if (!topic || !lines) return null;
  const { tokens, expressions } = parseMarkedText(topic.text);
  // 追加後に本文を書き換えていたら対応づけない
  if (tokens.length !== entry.tokens.length || tokens.some((t, i) => t !== entry.tokens[i])) return null;

  const sentenceOf = sentenceIndices(tokens);
  const sentenceCount = sentenceOf.length ? sentenceOf[sentenceOf.length - 1]! + 1 : 0;
  if (sentenceCount !== lines.length) return null;

  const sentenceEnds: number[] = [];
  sentenceOf.forEach((s, i) => (sentenceEnds[s] = i));

  const exprOfToken = new Map<number, number>();
  expressions.forEach((indices, e) => indices.forEach((i) => exprOfToken.set(i, e)));

  const sentences = lines.map((line, s) => {
    // この文に属する表現の、本文全体での番号を先頭から順に並べる
    const local = expressions.flatMap((indices, e) => (sentenceOf[indices[0]!] === s ? [e] : []));
    return parseJpLine(line).map((seg) =>
      seg.expr === undefined ? seg : { text: seg.text, expr: local[seg.expr] },
    );
  });
  return { sentences, sentenceEnds, exprOfToken };
}
