import raw from '../data/presetTopics.txt?raw';
import { parsePresetTopics } from './presets';

export const PRESET_TOPICS = parsePresetTopics(raw);
