import type { Deck, Entry } from '../types';
import { TASK1_PREFIX, TOEFL_PREFIX } from './presets';

/** 自分専用版の既定のタブ。IELTS の Task 2・Task 1 と TOEFL の Email を分ける */
export const DEFAULT_DECKS: Deck[] = [
  { id: 'ielts-task2', name: 'IELTS Task 2' },
  { id: 'ielts-task1', name: 'IELTS Task 1' },
  { id: 'toefl-email', name: 'TOEFL Email' },
];

export const TASK2_DECK_ID = 'ielts-task2';
export const TASK1_DECK_ID = 'ielts-task1';
export const TOEFL_DECK_ID = 'toefl-email';

/** タブを編集して保存した後に増えた既定のタブは、末尾に足して出す */
export function withNewDefaultDecks(decks: Deck[], known: string[] = []): Deck[] {
  const missing = DEFAULT_DECKS.filter((d) => !decks.some((x) => x.id === d.id) && !known.includes(d.id));
  return missing.length ? [...decks, ...missing] : decks;
}

/** 英文が入っているタブ。タブ未指定の英文は、内蔵題材ならその種類のタブ、それ以外は先頭のタブ */
export function deckIdOf(entry: Entry, decks: Deck[]): string {
  if (entry.deckId && decks.some((d) => d.id === entry.deckId)) return entry.deckId;
  const presetDeck = entry.presetId?.startsWith(TASK1_PREFIX)
    ? TASK1_DECK_ID
    : entry.presetId?.startsWith(TOEFL_PREFIX)
      ? TOEFL_DECK_ID
      : null;
  if (presetDeck && decks.some((d) => d.id === presetDeck)) return presetDeck;
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
