import type { SessionRecord } from '../types';

export function accuracyRate(sessions: SessionRecord[]): number | null {
  if (sessions.length === 0) return null;
  const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correctCount, 0);
  if (totalQuestions === 0) return null;
  return totalCorrect / totalQuestions;
}

export function studyCount(sessions: SessionRecord[]): number {
  return sessions.length;
}

export function sessionsForEntry(sessions: SessionRecord[], entryId: string): SessionRecord[] {
  return sessions
    .filter((s) => s.entryId === entryId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
