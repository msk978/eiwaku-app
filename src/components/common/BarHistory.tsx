import type { SessionRecord } from '../../types';

export function BarHistory({ sessions }: { sessions: SessionRecord[] }) {
  if (sessions.length === 0) {
    return <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>まだ学習記録がありません</p>;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, paddingBottom: 18 }}>
      {sessions.map((s, i) => {
        const pct = s.totalQuestions === 0 ? 0 : Math.round((s.correctCount / s.totalQuestions) * 100);
        const isLast = i === sessions.length - 1;
        return (
          <div
            key={s.id}
            style={{
              flex: 1,
              position: 'relative',
              height: `${Math.max(pct, 4)}%`,
              background: isLast ? 'var(--accent)' : 'var(--accent-soft)',
              borderRadius: '5px 5px 0 0',
            }}
          >
            <span
              style={{
                position: 'absolute',
                bottom: -18,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: 10,
                color: 'var(--text-muted)',
              }}
            >
              {i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}
