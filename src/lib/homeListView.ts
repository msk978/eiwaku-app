import { accuracyRate, lastStudiedAt, sessionsForEntry } from './stats';
import { joinTokens } from './joinTokens';
import type { Entry, SessionRecord } from '../types';

export type SortMode = 'registered' | 'lastStudied' | 'accuracy';

export interface HomeListRow {
  entry: Entry;
  lastStudied: string | null;
  accuracy: number | null;
}

function matches(entry: Entry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  if (entry.title?.toLowerCase().includes(q)) return true;
  return joinTokens(entry.tokens).toLowerCase().includes(q);
}

function compareNullableDesc(a: number | string | null, b: number | string | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a > b ? -1 : a < b ? 1 : 0;
}

export function filterAndSortEntries(
  entries: Entry[],
  sessions: SessionRecord[],
  query: string,
  sortMode: SortMode,
): HomeListRow[] {
  const rows = entries
    .filter((entry) => matches(entry, query))
    .map((entry) => {
      const entrySessions = sessionsForEntry(sessions, entry.id);
      return {
        entry,
        lastStudied: lastStudiedAt(entrySessions),
        accuracy: accuracyRate(entrySessions),
      };
    });

  if (sortMode === 'lastStudied') {
    return rows.sort((a, b) => compareNullableDesc(a.lastStudied, b.lastStudied));
  }
  if (sortMode === 'accuracy') {
    return rows.sort((a, b) => compareNullableDesc(a.accuracy, b.accuracy));
  }
  return rows;
}
