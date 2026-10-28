export interface Entry {
  id: string;
  createdAt: string;
  tokens: string[];
  title?: string;
  /** 手動で修正した和訳。キーはトークンのインデックス */
  glosses?: Record<string, string>;
  /** 出題割合に関係なく常に穴にするトークンのインデックス */
  pinned?: number[];
  /** 自動の穴埋めでは出題しないトークンのインデックス */
  excluded?: number[];
  /** 内蔵の教材ライブラリから追加した題材のID */
  presetId?: string;
  /** 入っているタブ(自分専用版)。無ければ presetId などから決める */
  deckId?: string;
}

/** ホームのタブ(自分専用版)。名前は自由に変えられる */
export interface Deck {
  id: string;
  name: string;
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
  /** 自分専用版のタブ。未設定なら既定のタブを使う */
  decks?: Deck[];
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
