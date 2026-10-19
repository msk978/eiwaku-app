import raw from '../data/presetTopics.txt?raw';
import translationsRaw from '../data/presetTranslations.txt?raw';
import { parsePresetTopics, type PresetTopic } from './presets';
import { parseTranslations } from './translation';

let topics: PresetTopic[] | null = null;
let translations: Map<string, string[]> | null = null;

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
