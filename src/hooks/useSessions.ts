import { useCallback, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { accuracyRate, sessionsForEntry, studyCount } from '../lib/stats';

export function useSessions(entryId: string) {
  const { data, dispatch } = useAppData();

  const sessions = useMemo(() => sessionsForEntry(data.sessions, entryId), [data.sessions, entryId]);

  const addSession = useCallback(
    (totalQuestions: number, correctCount: number) => {
      dispatch({
        type: 'ADD_SESSION',
        session: {
          id: crypto.randomUUID(),
          entryId,
          timestamp: new Date().toISOString(),
          totalQuestions,
          correctCount,
        },
      });
    },
    [dispatch, entryId],
  );

  return {
    sessions,
    addSession,
    accuracyRate: accuracyRate(sessions),
    studyCount: studyCount(sessions),
  };
}
