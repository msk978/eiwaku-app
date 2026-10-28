import raw from '../data/presetTopics.txt?raw';
import translationsRaw from '../data/presetTranslations.txt?raw';
import task1Raw from '../data/task1Topics.txt?raw';
import task1TranslationsRaw from '../data/task1Translations.txt?raw';
import { parsePresetTopics, TASK1_PREFIX, type PresetTopic } from './presets';
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

/** Task 2・Task 1 を合わせた内蔵の題材と和訳 */
export function getAllPresetTopics(): PresetTopic[] {
  return [...getPresetTopics(), ...getTask1Topics()];
}

export function getAllPresetTranslations(): Map<string, string[]> {
  return new Map([...getPresetTranslations(), ...getTask1Translations()]);
}

/** Task 1 の題材の図(SVG のソース)。図の無い題材なら null */
export function getTask1Figure(presetId: string | undefined): string | null {
  if (!presetId?.startsWith(TASK1_PREFIX)) return null;
  return task1Figures[`../data/task1Figures/${presetId.slice(TASK1_PREFIX.length)}.svg`] ?? null;
}
