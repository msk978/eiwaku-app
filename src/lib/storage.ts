import type { AppData } from '../types';
import { IS_EVERYONE } from './target';

// みんな向けの IELTS 版は公開版と同じドメインに置くので、保存先を分けて混ざらないようにする
const STORAGE_KEY = IS_EVERYONE ? 'eiwaku_ielts_data_v1' : 'eiwaku_app_data_v1';

export const INITIAL_DATA: AppData = {
  schemaVersion: 1,
  entries: [],
  markings: [],
  sessions: [],
  settings: { quizRatio: 0.5 },
};

function isValidAppData(x: unknown): x is AppData {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    o.schemaVersion === 1 &&
    Array.isArray(o.entries) &&
    Array.isArray(o.markings) &&
    Array.isArray(o.sessions) &&
    typeof (o.settings as Record<string, unknown> | undefined)?.quizRatio === 'number'
  );
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DATA;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidAppData(parsed)) return INITIAL_DATA;
    return parsed;
  } catch {
    return INITIAL_DATA;
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 保存できない環境(プライベートブラウズなど)では何もしない
  }
}
