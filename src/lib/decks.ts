import type { Deck, Entry } from '../types';
import { TASK1_PREFIX } from './presets';

/** 自分専用版の既定のタブ。Task 2 のエッセイと Task 1 のレポートを分ける */
export const DEFAULT_DECKS: Deck[] = [
  { id: 'ielts-task2', name: 'IELTS Task 2' },
  { id: 'ielts-task1', name: 'IELTS Task 1' },
];

export const TASK2_DECK_ID = 'ielts-task2';
export const TASK1_DECK_ID = 'ielts-task1';

/** 英文が入っているタブ。タブ未指定の英文は、Task 1 の題材なら Task 1、それ以外は先頭のタブ */
export function deckIdOf(entry: Entry, decks: Deck[]): string {
  if (entry.deckId && decks.some((d) => d.id === entry.deckId)) return entry.deckId;
  if (entry.presetId?.startsWith(TASK1_PREFIX) && decks.some((d) => d.id === TASK1_DECK_ID)) return TASK1_DECK_ID;
  return decks[0]!.id;
}

const SELECTED_KEY = 'eiwaku_selected_deck';

/** 最後に開いていたタブ(端末ごと) */
export function loadSelectedDeckId(): string | null {
  try {
    return localStorage.getItem(SELECTED_KEY);
  } catch {
    return null;
  }
}

export function saveSelectedDeckId(id: string): void {
  try {
    localStorage.setItem(SELECTED_KEY, id);
  } catch {
    // 保存できない環境では毎回先頭のタブから
  }
}
