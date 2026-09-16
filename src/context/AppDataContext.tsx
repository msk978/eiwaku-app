import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { AppData, Entry, MarkingRange, QuizMode, SessionRecord } from '../types';
import { loadData, saveData } from '../lib/storage';

type Action =
  | { type: 'ADD_ENTRY'; entry: Entry }
  | { type: 'DELETE_ENTRY'; entryId: string }
  | { type: 'SET_ENTRY_TITLE'; entryId: string; title: string | undefined }
  | { type: 'SET_MARKING_RANGES'; entryId: string; ranges: MarkingRange[] }
  | { type: 'ADD_SESSION'; session: SessionRecord }
  | { type: 'SET_QUIZ_RATIO'; ratio: number }
  | { type: 'SET_QUIZ_MODE'; mode: QuizMode }
  | { type: 'SET_SHOW_GLOSS_HINTS'; show: boolean }
  | { type: 'SET_GLOSS'; entryId: string; index: number; gloss: string | undefined }
  | { type: 'TOGGLE_PIN'; entryId: string; index: number }
  | { type: 'CLEAR_PINS'; entryId: string }
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
    case 'SET_ENTRY_TITLE':
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.entryId ? { ...e, title: action.title } : e,
        ),
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
    case 'SET_QUIZ_MODE':
      return { ...state, settings: { ...state.settings, quizMode: action.mode } };
    case 'SET_SHOW_GLOSS_HINTS':
      return { ...state, settings: { ...state.settings, showGlossHints: action.show } };
    case 'SET_GLOSS':
      return {
        ...state,
        entries: state.entries.map((e) => {
          if (e.id !== action.entryId) return e;
          const glosses = { ...e.glosses };
          if (action.gloss) glosses[action.index] = action.gloss;
          else delete glosses[action.index];
          return { ...e, glosses };
        }),
      };
    case 'TOGGLE_PIN':
      return {
        ...state,
        entries: state.entries.map((e) => {
          if (e.id !== action.entryId) return e;
          const pinned = e.pinned ?? [];
          return {
            ...e,
            pinned: pinned.includes(action.index)
              ? pinned.filter((i) => i !== action.index)
              : [...pinned, action.index].sort((a, b) => a - b),
          };
        }),
      };
    case 'CLEAR_PINS':
      return {
        ...state,
        entries: state.entries.map((e) => (e.id === action.entryId ? { ...e, pinned: [] } : e)),
      };
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
