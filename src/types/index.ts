export interface Entry {
  id: string;
  createdAt: string;
  tokens: string[];
  title?: string;
  /** 手動で修正した和訳。キーはトークンのインデックス */
  glosses?: Record<string, string>;
  /** 出題割合に関係なく常に穴にするトークンのインデックス */
  pinned?: number[];
}

export interface MarkingRange {
  start: number;
  end: number;
}

export interface MarkingSet {
  entryId: string;
  ranges: MarkingRange[];
}

export interface SessionRecord {
  id: string;
  entryId: string;
  timestamp: string;
  totalQuestions: number;
  correctCount: number;
}

export type QuizMode = 'marked' | 'allWords';

export interface Settings {
  quizRatio: number;
  quizMode?: QuizMode;
  showGlossHints?: boolean;
}

export interface AppData {
  schemaVersion: 1;
  entries: Entry[];
  markings: MarkingSet[];
  sessions: SessionRecord[];
  settings: Settings;
}

export interface ExportFileV1 {
  schemaVersion: 1;
  exportedAt: string;
  data: {
    entries: Entry[];
    markings: MarkingSet[];
    sessions: SessionRecord[];
    settings: Settings;
  };
}
