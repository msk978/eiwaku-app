import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '../../hooks/useEntries';
import { useAppData } from '../../context/AppDataContext';
import { studyCount } from '../../lib/stats';
import { joinTokens } from '../../lib/joinTokens';
import { formatRelativeDate } from '../../lib/relativeDate';
import { filterAndSortEntries, type SortMode } from '../../lib/homeListView';
import { sessionsForEntry } from '../../lib/stats';
import { Fab } from '../common/Fab';
import { EmptyState } from '../common/EmptyState';
import { GearIcon } from '../common/icons';

const SORT_LABEL: Record<SortMode, string> = {
  registered: '登録順',
  lastStudied: '最近学習した順',
  accuracy: '正答率順',
};

export function HomeScreen() {
  const navigate = useNavigate();
  const { entries } = useEntries();
  const { data } = useAppData();
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('registered');

  const rows = useMemo(
    () => filterAndSortEntries(entries, data.sessions, query, sortMode),
    [entries, data.sessions, query, sortMode],
  );

  return (
    <div className="app-shell" style={{ position: 'relative' }}>
      <div className="topbar">
        <div className="topbar-title">穴埋め暗記</div>
        <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={() => navigate('/settings')} aria-label="設定">
          <GearIcon />
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          message={'まだ英文が登録されていません。\n右下のボタンから最初の英文を登録しましょう。'}
        />
      ) : (
        <div className="screen-body" style={{ paddingBottom: 100 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="タイトル・本文を検索"
              style={{
                flex: 1,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '9px 14px',
                fontSize: 14,
                color: 'var(--text)',
              }}
            />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '9px 10px',
                fontSize: 13,
                color: 'var(--text)',
              }}
            >
              {(Object.keys(SORT_LABEL) as SortMode[]).map((mode) => (
                <option key={mode} value={mode}>
                  {SORT_LABEL[mode]}
                </option>
              ))}
            </select>
          </div>

          {rows.length === 0 ? (
            <EmptyState message={`「${query}」に一致する英文はありません`} />
          ) : (
            rows.map(({ entry, lastStudied, accuracy }) => {
              const sessions = sessionsForEntry(data.sessions, entry.id);
              const preview = joinTokens(entry.tokens.slice(0, 24));
              return (
                <div
                  key={entry.id}
                  className="card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/entries/${entry.id}`)}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  {entry.title && (
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{entry.title}</div>
                  )}
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 15,
                      lineHeight: 1.55,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {preview}
                    {entry.tokens.length > 24 ? '...' : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--text-muted)' }}>
                    <span>{entry.tokens.filter((t) => /[A-Za-z0-9]/.test(t)).length}語</span>
                    <span>正答率 {accuracy === null ? '—' : `${Math.round(accuracy * 100)}%`}</span>
                    <span>学習 {studyCount(sessions)}回</span>
                    <span>{formatRelativeDate(lastStudied)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <Fab onClick={() => navigate('/new')} />
    </div>
  );
}
