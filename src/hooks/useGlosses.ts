import { useCallback, useEffect, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { dictionaryLetter, lookupGloss, parseDictionary, type Dictionary } from '../lib/dictionary';
import type { Entry } from '../types';

const letterCache = new Map<string, Promise<Dictionary>>();

function loadLetter(letter: string): Promise<Dictionary> {
  let promise = letterCache.get(letter);
  if (!promise) {
    promise = fetch(`${import.meta.env.BASE_URL}dict/${letter}.txt`)
      .then((res) => (res.ok ? res.text() : ''))
      .then(parseDictionary)
      .catch(() => {
        letterCache.delete(letter);
        return new Map();
      });
    letterCache.set(letter, promise);
  }
  return promise;
}

export interface GlossInfo {
  text: string | undefined;
  overridden: boolean;
}

/** 指定したトークン位置の和訳(手動修正 > 内蔵辞書)を返す。辞書は必要な頭文字の分だけ読み込む */
export function useGlosses(entry: Entry | undefined, indices: number[]) {
  const { dispatch } = useAppData();
  const [dicts, setDicts] = useState<Map<string, Dictionary>>(new Map());

  const letters = [
    ...new Set(indices.map((i) => dictionaryLetter(entry?.tokens[i] ?? '')).filter((l): l is string => l !== null)),
  ]
    .sort()
    .join('');

  useEffect(() => {
    let cancelled = false;
    for (const letter of letters) {
      void loadLetter(letter).then((dict) => {
        if (cancelled) return;
        setDicts((prev) => (prev.has(letter) ? prev : new Map(prev).set(letter, dict)));
      });
    }
    return () => {
      cancelled = true;
    };
  }, [letters]);

  const glossFor = useCallback(
    (index: number): GlossInfo => {
      const override = entry?.glosses?.[index];
      if (override) return { text: override, overridden: true };
      const word = entry?.tokens[index] ?? '';
      const letter = dictionaryLetter(word);
      const dict = letter ? dicts.get(letter) : undefined;
      return { text: dict ? lookupGloss(dict, word) : undefined, overridden: false };
    },
    [entry, dicts],
  );

  const setGloss = useCallback(
    (index: number, gloss: string) => {
      if (!entry) return;
      const trimmed = gloss.trim();
      dispatch({ type: 'SET_GLOSS', entryId: entry.id, index, gloss: trimmed ? trimmed : undefined });
    },
    [dispatch, entry],
  );

  return { glossFor, setGloss };
}
