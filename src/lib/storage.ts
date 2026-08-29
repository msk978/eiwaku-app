import type { AppData } from '../types';

const STORAGE_KEY = 'eiwaku_app_data_v1';

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
