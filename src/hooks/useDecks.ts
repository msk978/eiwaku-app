import { useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import { DEFAULT_DECKS, deckIdOf } from '../lib/decks';
import { IS_PERSONAL } from '../lib/target';
import type { Deck, Entry } from '../types';

/** ホームのタブ(自分専用版だけ。公開版ではタブを使わず全件を1つの一覧にする) */
export function useDecks() {
  const { data, dispatch } = useAppData();
  const decks = data.settings.decks?.length ? data.settings.decks : DEFAULT_DECKS;

  const setDecks = useCallback((next: Deck[]) => dispatch({ type: 'SET_DECKS', decks: next }), [dispatch]);

  /** 同じタブに入っている英文だけにする(前後の移動をタブ内にとどめる) */
  const sameDeck = useCallback(
    (entries: Entry[], current: Entry) => {
      if (!IS_PERSONAL) return entries;
      const deckId = deckIdOf(current, decks);
      return entries.filter((e) => deckIdOf(e, decks) === deckId);
    },
    [decks],
  );

  return { enabled: IS_PERSONAL, decks, setDecks, sameDeck };
}
