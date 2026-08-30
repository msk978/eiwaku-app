import { useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import { tokenize } from '../lib/tokenize';
import type { Entry } from '../types';

export function useEntries() {
  const { data, dispatch } = useAppData();

  const addEntry = useCallback(
    (rawText: string, title?: string): Entry => {
      const trimmedTitle = title?.trim();
      const entry: Entry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        tokens: tokenize(rawText),
        title: trimmedTitle ? trimmedTitle : undefined,
      };
      dispatch({ type: 'ADD_ENTRY', entry });
      return entry;
    },
    [dispatch],
  );

  const setEntryTitle = useCallback(
    (entryId: string, title: string) => {
      const trimmed = title.trim();
      dispatch({ type: 'SET_ENTRY_TITLE', entryId, title: trimmed ? trimmed : undefined });
    },
    [dispatch],
  );

  const deleteEntry = useCallback(
    (entryId: string) => {
      dispatch({ type: 'DELETE_ENTRY', entryId });
    },
    [dispatch],
  );

  const getEntry = useCallback(
    (entryId: string) => data.entries.find((e) => e.id === entryId),
    [data.entries],
  );

  return { entries: data.entries, addEntry, deleteEntry, getEntry, setEntryTitle };
}
