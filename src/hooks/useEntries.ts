import { useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import { tokenize } from '../lib/tokenize';
import type { Entry } from '../types';

export function useEntries() {
  const { data, dispatch } = useAppData();

  const addEntry = useCallback(
    (rawText: string): Entry => {
      const entry: Entry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        tokens: tokenize(rawText),
      };
      dispatch({ type: 'ADD_ENTRY', entry });
      return entry;
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

  return { entries: data.entries, addEntry, deleteEntry, getEntry };
}
