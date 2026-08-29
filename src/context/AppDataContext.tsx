import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { AppData, Entry, MarkingRange, SessionRecord } from '../types';
import { loadData, saveData } from '../lib/storage';

type Action =
  | { type: 'ADD_ENTRY'; entry: Entry }
  | { type: 'DELETE_ENTRY'; entryId: string }
  | { type: 'SET_MARKING_RANGES'; entryId: string; ranges: MarkingRange[] }
  | { type: 'ADD_SESSION'; session: SessionRecord }
  | { type: 'SET_QUIZ_RATIO'; ratio: number }
  | { type: 'REPLACE_ALL'; data: AppData };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'ADD_ENTRY':
      return {
        ...state,
        entries: [...state.entries, action.entry],
        markings: [...state.markings, { entryId: action.entry.id, ranges: [] }],
      };
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.entryId),
        markings: state.markings.filter((m) => m.entryId !== action.entryId),
        sessions: state.sessions.filter((s) => s.entryId !== action.entryId),
      };
    case 'SET_MARKING_RANGES': {
      const exists = state.markings.some((m) => m.entryId === action.entryId);
      const markings = exists
        ? state.markings.map((m) =>
            m.entryId === action.entryId ? { ...m, ranges: action.ranges } : m,
          )
        : [...state.markings, { entryId: action.entryId, ranges: action.ranges }];
      return { ...state, markings };
    }
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.session] };
    case 'SET_QUIZ_RATIO':
      return { ...state, settings: { ...state.settings, quizRatio: action.ratio } };
    case 'REPLACE_ALL':
      return action.data;
    default:
      return state;
  }
}

interface AppDataContextValue {
  data: AppData;
  dispatch: React.Dispatch<Action>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const value = useMemo(() => ({ data, dispatch }), [data]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
