import { useRef, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useEntries } from '../../hooks/useEntries';
import { useSettings } from '../../hooks/useSettings';
import { buildExportFile, parseImportFile, type ImportError } from '../../lib/exportImport';
import { joinTokens } from '../../lib/joinTokens';
import { BackButton } from '../common/BackButton';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TrashIcon } from '../common/icons';
import type { Entry } from '../../types';

function importErrorMessage(kind: ImportError['kind']): string {
  switch (kind) {
    case 'parse':
      return 'ファイルを読み込めませんでした。JSON形式のバックアップファイルを選択してください。';
    case 'unsupported-version':
      return '対応していないバージョンのバックアップファイルです。';
    case 'invalid-shape':
      return 'データ形式が不正です。破損している可能性があります。';
    case 'invalid-reference':
      return 'データの参照関係が不正です。破損している可能性があります。';
  }
}

export function SettingsScreen() {
  const { data, dispatch } = useAppData();
  const { settings } = useSettings();
  const { entries, deleteEntry } = useEntries();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImportRaw, setPendingImportRaw] = useState<string | null>(null);

  const handleExport = () => {
    const file = buildExportFile(data);
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eiwaku-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    const text = await file.text();
    const result = parseImportFile(text);
    if (!result.ok) {
      setImportError(importErrorMessage(result.error.kind));
      return;
    }
    setPendingImportRaw(text);
  };

  const confirmImport = () => {
    if (!pendingImportRaw) return;
    const result = parseImportFile(pendingImportRaw);
    if (result.ok) {
      dispatch({ type: 'REPLACE_ALL', data: result.data });
    }
    setPendingImportRaw(null);
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <BackButton to="/" />
        <div className="topbar-title">設定</div>
      </div>

      <div className="screen-body">
        <div>
          <div className="section-label">学習設定</div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14.5 }}>出題する割合</span>
              <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                {Math.round(settings.quizRatio * 100)}%(学習開始画面で変更)
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="section-label">データ管理</div>
          <div className="card" style={{ padding: 0 }}>
            <button
              onClick={handleExport}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '16px 18px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', textAlign: 'left' }}
            >
              <span style={{ fontSize: 14.5, color: 'var(--text)' }}>データをエクスポート</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>書き出す</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '16px 18px', background: 'none', border: 'none', textAlign: 'left' }}
            >
              <span style={{ fontSize: 14.5, color: 'var(--text)' }}>データをインポート</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>読み込む</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImportFile(file);
                e.target.value = '';
              }}
            />
          </div>
          {importError && (
            <p style={{ fontSize: 12.5, color: 'var(--danger)', marginTop: 8 }}>{importError}</p>
          )}
        </div>

        <div>
          <div className="section-label">英文の削除</div>
          {entries.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>登録済みの英文はありません</p>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              {entries.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    gap: 12,
                    borderTop: i > 0 ? '1px solid var(--border)' : undefined,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 13.5,
                      flex: 1,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {joinTokens(entry.tokens.slice(0, 12))}...
                  </span>
                  <button
                    onClick={() => setDeleteTarget(entry)}
                    aria-label="削除"
                    style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', flexShrink: 0 }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="この英文を削除しますか？"
          detail={`${joinTokens(deleteTarget.tokens.slice(0, 16))}...`}
          body="マーキングと学習履歴もすべて削除されます。この操作は取り消せません。"
          confirmLabel="削除する"
          danger
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteEntry(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}

      {pendingImportRaw && (
        <ConfirmDialog
          title="現在のデータを置き換えますか？"
          body="インポートしたデータで現在のすべての英文・マーキング・学習履歴を置き換えます。元に戻せません。"
          confirmLabel="置き換える"
          danger
          onCancel={() => setPendingImportRaw(null)}
          onConfirm={confirmImport}
        />
      )}
    </div>
  );
}
