import { describe, expect, it } from 'vitest';
import { buildExportFile, parseImportFile } from './exportImport';
import type { AppData } from '../types';

const validData: AppData = {
  schemaVersion: 1,
  entries: [{ id: 'e1', createdAt: '2026-01-01T00:00:00.000Z', tokens: ['hi', 'there'] }],
  markings: [{ entryId: 'e1', ranges: [{ start: 0, end: 0 }] }],
  sessions: [{ id: 's1', entryId: 'e1', timestamp: '2026-01-02T00:00:00.000Z', totalQuestions: 1, correctCount: 1 }],
  settings: { quizRatio: 0.5 },
};

describe('buildExportFile / parseImportFile round trip', () => {
  it('round-trips valid data', () => {
    const file = buildExportFile(validData);
    const result = parseImportFile(JSON.stringify(file));
    expect(result).toEqual({ ok: true, data: validData });
  });

  it('rejects unparseable JSON', () => {
    const result = parseImportFile('{not json');
    expect(result).toEqual({ ok: false, error: { kind: 'parse' } });
  });

  it('rejects an unsupported schema version', () => {
    const file = { ...buildExportFile(validData), schemaVersion: 2 };
    const result = parseImportFile(JSON.stringify(file));
    expect(result).toEqual({ ok: false, error: { kind: 'unsupported-version' } });
  });

  it('rejects a marking range whose end is out of bounds for its entry', () => {
    const file = buildExportFile({
      ...validData,
      markings: [{ entryId: 'e1', ranges: [{ start: 0, end: 99 }] }],
    });
    const result = parseImportFile(JSON.stringify(file));
    expect(result).toEqual({ ok: false, error: { kind: 'invalid-shape' } });
  });

  it('rejects a marking that references a non-existent entry', () => {
    const file = buildExportFile({
      ...validData,
      markings: [{ entryId: 'does-not-exist', ranges: [{ start: 0, end: 0 }] }],
    });
    const result = parseImportFile(JSON.stringify(file));
    expect(result).toEqual({ ok: false, error: { kind: 'invalid-reference' } });
  });

  it('rejects a session that references a non-existent entry', () => {
    const file = buildExportFile({
      ...validData,
      sessions: [{ id: 's1', entryId: 'does-not-exist', timestamp: '2026-01-01T00:00:00.000Z', totalQuestions: 1, correctCount: 1 }],
    });
    const result = parseImportFile(JSON.stringify(file));
    expect(result).toEqual({ ok: false, error: { kind: 'invalid-reference' } });
  });

  it('rejects data missing required fields', () => {
    const result = parseImportFile(JSON.stringify({ schemaVersion: 1, data: {} }));
    expect(result).toEqual({ ok: false, error: { kind: 'invalid-shape' } });
  });
});
