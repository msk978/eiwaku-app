import raw from '../data/presetTopics.txt?raw';
import translationsRaw from '../data/presetTranslations.txt?raw';
import task1Raw from '../data/task1Topics.txt?raw';
import task1TranslationsRaw from '../data/task1Translations.txt?raw';
import toeflRaw from '../data/toeflTopics.txt?raw';
import toeflTranslationsRaw from '../data/toeflTranslations.txt?raw';
import toeflPromptsRaw from '../data/toeflPrompts.txt?raw';
import { lineBreaks, parseMarkedText, parsePresetTopics, TASK1_PREFIX, TOEFL_PREFIX, type PresetTopic } from './presets';
import type { Entry } from '../types';
import { parseTranslations } from './translation';

const task1Figures = import.meta.glob<string>('../data/task1Figures/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

let topics: PresetTopic[] | null = null;
let translations: Map<string, string[]> | null = null;
let task1Topics: PresetTopic[] | null = null;
let task1Translations: Map<string, string[]> | null = null;
let toeflTopics: PresetTopic[] | null = null;
let toeflTranslations: Map<string, string[]> | null = null;
let toeflPrompts: Map<string, TaskPrompt> | null = null;

/** 個人版だけで使う内蔵の題材(公開版のバンドルに入らないよう、呼ばれたときに読む) */
export function getPresetTopics(): PresetTopic[] {
  topics ??= parsePresetTopics(raw);
  return topics;
}

/** 内蔵の題材の全文和訳(キーは presetId) */
export function getPresetTranslations(): Map<string, string[]> {
  translations ??= parseTranslations(translationsRaw);
  return translations;
}

/** IELTS Task 1 のモデルアンサー(図と一緒に出す) */
export function getTask1Topics(): PresetTopic[] {
  task1Topics ??= parsePresetTopics(task1Raw, TASK1_PREFIX);
  return task1Topics;
}

export function getTask1Translations(): Map<string, string[]> {
  task1Translations ??= parseTranslations(task1TranslationsRaw, TASK1_PREFIX);
  return task1Translations;
}

/** TOEFL Writing の Email のモデルアンサー(問題文と一緒に出す) */
export function getToeflTopics(): PresetTopic[] {
  toeflTopics ??= parsePresetTopics(toeflRaw, TOEFL_PREFIX);
  return toeflTopics;
}

export function getToeflTranslations(): Map<string, string[]> {
  toeflTranslations ??= parseTranslations(toeflTranslationsRaw, TOEFL_PREFIX);
  return toeflTranslations;
}

/** 内蔵の題材すべて(IELTS Task 2・Task 1・TOEFL)と和訳 */
export function getAllPresetTopics(): PresetTopic[] {
  return [...getPresetTopics(), ...getTask1Topics(), ...getToeflTopics()];
}

export function getAllPresetTranslations(): Map<string, string[]> {
  return new Map([...getPresetTranslations(), ...getTask1Translations(), ...getToeflTranslations()]);
}

/** Task 1 の題材の図(SVG のソース)。図の無い題材なら null */
export function getTask1Figure(presetId: string | undefined): string | null {
  if (!presetId?.startsWith(TASK1_PREFIX)) return null;
  return task1Figures[`../data/task1Figures/${presetId.slice(TASK1_PREFIX.length)}.svg`] ?? null;
}

/** TOEFL の Email の問題文 */
export interface TaskPrompt {
  /** To: や Subject: の行 */
  headers: string[];
  /** 状況の説明と指示文 */
  paragraphs: string[];
  /** 満たすべき3つの要件 */
  requirements: string[];
}

/** 「**番号**」の見出しの下に、To:/Subject: の行・説明・「- 」で始まる要件が並んだテキストを読む */
export function parseTaskPrompts(raw: string, idPrefix: string): Map<string, TaskPrompt> {
  const map = new Map<string, TaskPrompt>();
  let current: TaskPrompt | null = null;
  for (const line of raw.split(/\r?\n/).map((l) => l.trim())) {
    const heading = /^\*\*(\d+)\*\*$/.exec(line);
    if (heading) {
      current = { headers: [], paragraphs: [], requirements: [] };
      map.set(`${idPrefix}${heading[1]}`, current);
    } else if (current && line) {
      if (line.startsWith('- ')) current.requirements.push(line.slice(2));
      else if (/^(To|Subject):/.test(line)) current.headers.push(line);
      else current.paragraphs.push(line);
    }
  }
  return map;
}

/** TOEFL の題材の問題文。問題文の無い題材なら null */
export function getToeflPrompt(presetId: string | undefined): TaskPrompt | null {
  if (!presetId?.startsWith(TOEFL_PREFIX)) return null;
  toeflPrompts ??= parseTaskPrompts(toeflPromptsRaw, TOEFL_PREFIX);
  return toeflPrompts.get(presetId) ?? null;
}

/**
 * 内蔵題材から追加した英文の改行位置(行の最後のトークンのインデックス → 段落の切れ目なら true)。
 * 登録時にはトークンしか保存していないので、元の題材から割り出す。本文を編集していたら出さない。
 */
export function getPresetLineBreaks(entry: Entry): Map<number, boolean> {
  const topic = entry.presetId ? getAllPresetTopics().find((t) => t.presetId === entry.presetId) : undefined;
  if (!topic) return new Map();
  const total = parseMarkedText(topic.text).tokens.length;
  return total === entry.tokens.length ? lineBreaks(topic.text) : new Map();
}
