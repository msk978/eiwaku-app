import { useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';

export function useSettings() {
  const { data, dispatch } = useAppData();

  const setQuizRatio = useCallback(
    (ratio: number) => {
      dispatch({ type: 'SET_QUIZ_RATIO', ratio });
    },
    [dispatch],
  );

  return { settings: data.settings, setQuizRatio };
}
