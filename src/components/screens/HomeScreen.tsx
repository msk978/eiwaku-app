import { useNavigate } from 'react-router-dom';
import { useEntries } from '../../hooks/useEntries';
import { useAppData } from '../../context/AppDataContext';
import { accuracyRate, sessionsForEntry, studyCount } from '../../lib/stats';
import { joinTokens } from '../../lib/joinTokens';
import { Fab } from '../common/Fab';
import { EmptyState } from '../common/EmptyState';
import { GearIcon } from '../common/icons';

export function HomeScreen() {
  const navigate = useNavigate();
  const { entries } = useEntries();
  const { data } = useAppData();

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
          {entries.map((entry) => {
            const sessions = sessionsForEntry(data.sessions, entry.id);
            const rate = accuracyRate(sessions);
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
                  <span>正答率 {rate === null ? '—' : `${Math.round(rate * 100)}%`}</span>
                  <span>学習 {studyCount(sessions)}回</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Fab onClick={() => navigate('/new')} />
    </div>
  );
}
