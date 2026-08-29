import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRequireEntry } from '../../hooks/useRequireEntry';
import { useSessions } from '../../hooks/useSessions';
import { joinTokens } from '../../lib/joinTokens';

interface ResultState {
  total: number;
  correct: number;
}

export function ResultScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const entry = useRequireEntry(id);
  const { sessions } = useSessions(id ?? '');

  const state = location.state as ResultState | null;

  useEffect(() => {
    if (entry && !state) navigate(`/entries/${id}`, { replace: true });
  }, [entry, state, id, navigate]);

  if (!entry || !state) return null;

  const percent = state.total === 0 ? 0 : Math.round((state.correct / state.total) * 100);

  return (
    <div className="app-shell">
      <div className="topbar" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 500 }}>
          {joinTokens(entry.tokens.slice(0, 12))}...
        </div>
      </div>

      <div className="screen-body" style={{ alignItems: 'center' }}>
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: `conic-gradient(var(--accent) 0% ${percent}%, var(--border) ${percent}% 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'var(--surface)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 600 }}>{percent}%</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {state.correct} / {state.total} 正解
            </div>
          </div>
        </div>

        <div className="card" style={{ width: '100%' }}>
          <div className="section-label">これまでの推移</div>
          {sessions.map((s, i) => {
            const p = s.totalQuestions === 0 ? 0 : Math.round((s.correctCount / s.totalQuestions) * 100);
            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 0',
                  fontSize: 13,
                  borderTop: i > 0 ? '1px solid var(--border)' : undefined,
                }}
              >
                <span style={{ width: 76, color: 'var(--text-muted)' }}>
                  {i + 1}周目{i === sessions.length - 1 ? '(今回)' : ''}
                </span>
                <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${p}%`, background: 'var(--accent)', borderRadius: 3 }} />
                </div>
                <span style={{ width: 38, textAlign: 'right', fontWeight: 600 }}>{p}%</span>
              </div>
            );
          })}
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
          <button className="primary-btn" onClick={() => navigate(`/entries/${id}/quiz`, { replace: true })}>
            もう一周する
          </button>
          <button className="secondary-btn" onClick={() => navigate('/', { replace: true })}>
            一覧に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
