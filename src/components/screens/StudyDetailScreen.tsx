import { useNavigate, useParams } from 'react-router-dom';
import { useMarkings } from '../../hooks/useMarkings';
import { useRequireEntry } from '../../hooks/useRequireEntry';
import { useSessions } from '../../hooks/useSessions';
import { useSettings } from '../../hooks/useSettings';
import { joinTokens } from '../../lib/joinTokens';
import { BackButton } from '../common/BackButton';
import { BarHistory } from '../common/BarHistory';
import { RatioSlider } from '../common/RatioSlider';

export function StudyDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entry = useRequireEntry(id);
  const { ranges } = useMarkings(id ?? '');
  const { sessions, studyCount } = useSessions(id ?? '');
  const { settings, setQuizRatio } = useSettings();

  if (!entry) return null;

  const wordCount = entry.tokens.filter((t) => /[A-Za-z0-9]/.test(t)).length;
  const estimated = Math.min(ranges.length, Math.max(1, Math.round(ranges.length * settings.quizRatio)));

  return (
    <div className="app-shell">
      <div className="topbar">
        <BackButton to="/" />
        <div className="topbar-title">学習を始める</div>
      </div>

      <div className="screen-body">
        <div className="card">
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.6 }}>
            {joinTokens(entry.tokens.slice(0, 28))}
            {entry.tokens.length > 28 ? '...' : ''}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12.5, color: 'var(--text-muted)' }}>
            <span>{wordCount}語</span>
            <span>マーキング {ranges.length}箇所</span>
          </div>
        </div>

        <div>
          <div className="section-label">学習履歴</div>
          <div className="card" style={{ paddingTop: 22, paddingBottom: 30 }}>
            <BarHistory sessions={sessions} />
          </div>
        </div>

        <div>
          <div className="section-label">出題する割合(すべての英文に共通)</div>
          <div className="card">
            <RatioSlider
              ratio={settings.quizRatio}
              onChange={setQuizRatio}
              caption={ranges.length > 0 ? `今回出題される箇所: 約${estimated}箇所` : undefined}
            />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              マーキング済みの語句のうち、指定した割合をランダムに出題します。ここで変更すると他の英文にも適用されます。
            </div>
          </div>
        </div>

        <button
          className="primary-btn"
          style={{ marginTop: 'auto' }}
          disabled={ranges.length === 0}
          onClick={() => navigate(`/entries/${id}/quiz`)}
        >
          {ranges.length === 0 ? 'マーキングがありません' : '学習を始める'}
        </button>
        {ranges.length === 0 && (
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
            先に覚える語句をマーキングしてください
          </p>
        )}
        {ranges.length === 0 && (
          <button className="secondary-btn" onClick={() => navigate(`/entries/${id}/mark`)}>
            マーキングへ
          </button>
        )}
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>学習回数 {studyCount}回</p>
      </div>
    </div>
  );
}
