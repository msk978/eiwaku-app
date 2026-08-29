import type { AppData, ExportFileV1 } from '../types';

export function buildExportFile(data: AppData): ExportFileV1 {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    data: {
      entries: data.entries,
      markings: data.markings,
      sessions: data.sessions,
      settings: data.settings,
    },
  };
}

export type ImportError =
  | { kind: 'parse' }
  | { kind: 'unsupported-version' }
  | { kind: 'invalid-shape' }
  | { kind: 'invalid-reference' };

export type ImportResult =
  | { ok: true; data: AppData }
  | { ok: false; error: ImportError };

export function parseImportFile(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: { kind: 'parse' } };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: { kind: 'invalid-shape' } };
  }
  const o = parsed as Record<string, unknown>;

  if (o.schemaVersion !== 1) {
    return { ok: false, error: { kind: 'unsupported-version' } };
  }

  const d = o.data as Record<string, unknown> | undefined;
  if (
    !d ||
    !Array.isArray(d.entries) ||
    !Array.isArray(d.markings) ||
    !Array.isArray(d.sessions) ||
    typeof (d.settings as Record<string, unknown> | undefined)?.quizRatio !== 'number'
  ) {
    return { ok: false, error: { kind: 'invalid-shape' } };
  }

  const entries = d.entries as { id: unknown; tokens: unknown }[];
  for (const e of entries) {
    if (typeof e.id !== 'string' || !Array.isArray(e.tokens)) {
      return { ok: false, error: { kind: 'invalid-shape' } };
    }
  }

  const entryById = new Map<string, { tokens: unknown[] }>();
  for (const e of entries) {
    entryById.set(e.id as string, e as { tokens: unknown[] });
  }

  const markings = d.markings as { entryId: unknown; ranges: unknown }[];
  for (const m of markings) {
    if (typeof m.entryId !== 'string' || !entryById.has(m.entryId)) {
      return { ok: false, error: { kind: 'invalid-reference' } };
    }
    const entry = entryById.get(m.entryId)!;
    if (!Array.isArray(m.ranges)) {
      return { ok: false, error: { kind: 'invalid-shape' } };
    }
    for (const r of m.ranges as { start: unknown; end: unknown }[]) {
      if (
        typeof r.start !== 'number' ||
        typeof r.end !== 'number' ||
        r.start > r.end ||
        r.start < 0 ||
        r.end >= entry.tokens.length
      ) {
        return { ok: false, error: { kind: 'invalid-shape' } };
      }
    }
  }

  const sessions = d.sessions as { entryId: unknown }[];
  for (const s of sessions) {
    if (typeof s.entryId !== 'string' || !entryById.has(s.entryId)) {
      return { ok: false, error: { kind: 'invalid-reference' } };
    }
  }

  return {
    ok: true,
    data: {
      schemaVersion: 1,
      entries: d.entries as AppData['entries'],
      markings: d.markings as AppData['markings'],
      sessions: d.sessions as AppData['sessions'],
      settings: d.settings as AppData['settings'],
    },
  };
}
