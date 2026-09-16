import { tokenize } from './tokenize';
import type { Entry } from '../types';

export interface PresetTopic {
  /** 追加済みかどうかの判定に使う固定ID */
  presetId: string;
  title: string;
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

/** まだ追加していない題材だけを、登録用のEntryにする */
export function presetEntriesToAdd(topics: PresetTopic[], existing: Entry[], now = new Date()): Entry[] {
  const added = new Set(existing.map((e) => e.presetId).filter(Boolean));
  return topics
    .filter((t) => !added.has(t.presetId))
    .map((t, i) => ({
      id: crypto.randomUUID(),
      // 登録順を保つため1ミリ秒ずつずらす
      createdAt: new Date(now.getTime() + i).toISOString(),
      tokens: tokenize(t.text),
      title: t.title,
      presetId: t.presetId,
    }));
}
