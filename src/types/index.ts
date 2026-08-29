export interface Entry {
  id: string;
  createdAt: string;
  tokens: string[];
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

export interface Settings {
  quizRatio: number;
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
