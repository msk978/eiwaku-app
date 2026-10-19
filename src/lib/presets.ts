import { isWordToken, tokenize } from './tokenize';
import type { Entry, MarkingRange, MarkingSet } from '../types';

export interface PresetTopic {
  /** 追加済みかどうかの判定に使う固定ID */
  presetId: string;
  title: string;
  /** 本文。{{ }} で囲んだ部分は追加時にマーキング済みになる */
  text: string;
}

const HEADING_RE = /^\*\*(\d+)\.\s*(.+?)\*\*\s*$/;

/** 「**番号. タイトル**」の見出しと本文が並んだテキストを題材の一覧にする */
export function parsePresetTopics(raw: string): PresetTopic[] {
  const topics: PresetTopic[] = [];
  let current: { num: string; title: string; lines: string[] } | null = null;
  const flush = () => {
    if (!current) return;
    const text = current.lines.join('\n').trim();
    if (text) topics.push({ presetId: `topic-${current.num}`, title: `${current.num}. ${current.title}`, text });
  };
  for (const line of raw.split(/\r?\n/)) {
    const heading = HEADING_RE.exec(line);
    if (heading) {
      flush();
      current = { num: heading[1]!, title: heading[2]!.trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  flush();
  return topics;
}

/**
 * {{ }} の印を外してトークン化し、印の付いた語をマーキング範囲にする。
 * {{+ }} は直前の表現の続き(give them an edge in の an edge in など)で、同じ表現として数える。
 */
export function parseMarkedText(text: string): {
  tokens: string[];
  ranges: MarkingRange[];
  /** 表現ごとの、印の付いた語のトークンインデックス */
  expressions: number[][];
} {
  const tokens: string[] = [];
  const ranges: MarkingRange[] = [];
  const expressions: number[][] = [];
  text.split(/(\{\{.*?\}\})/s).forEach((part) => {
    const marked = part.startsWith('{{') && part.endsWith('}}');
    let body = marked ? part.slice(2, -2) : part;
    if (marked) {
      const continues = body.startsWith('+') && expressions.length > 0;
      body = body.replace(/^\+/, '');
      if (!continues) expressions.push([]);
    }
    for (const token of tokenize(body)) {
      if (marked && isWordToken(token)) {
        ranges.push({ start: tokens.length, end: tokens.length });
        expressions[expressions.length - 1]!.push(tokens.length);
      }
      tokens.push(token);
    }
  });
  return { tokens, ranges, expressions };
}

/** まだ追加していない題材だけを、登録用のEntryとマーキングにする */
export function presetEntriesToAdd(
  topics: PresetTopic[],
  existing: Entry[],
  now = new Date(),
): { entries: Entry[]; markings: MarkingSet[] } {
  const added = new Set(existing.map((e) => e.presetId).filter(Boolean));
  const entries: Entry[] = [];
  const markings: MarkingSet[] = [];
  topics
    .filter((t) => !added.has(t.presetId))
    .forEach((t, i) => {
      const { tokens, ranges } = parseMarkedText(t.text);
      const id = crypto.randomUUID();
      entries.push({
        id,
        // 登録順を保つため1ミリ秒ずつずらす
        createdAt: new Date(now.getTime() + i).toISOString(),
        tokens,
        title: t.title,
        presetId: t.presetId,
      });
      markings.push({ entryId: id, ranges });
    });
  return { entries, markings };
}
