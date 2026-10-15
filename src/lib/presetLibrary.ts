import raw from '../data/presetTopics.txt?raw';
import { parsePresetTopics, type PresetTopic } from './presets';

let cache: PresetTopic[] | null = null;

/** 個人版だけで使う内蔵の題材(公開版のバンドルに入らないよう、呼ばれたときに読む) */
export function getPresetTopics(): PresetTopic[] {
  cache ??= parsePresetTopics(raw);
  return cache;
}
