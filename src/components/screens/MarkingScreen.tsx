import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMarkings } from '../../hooks/useMarkings';
import { useRequireEntry } from '../../hooks/useRequireEntry';
import { handleTokenTap } from '../../lib/markingLogic';
import { MarkingParagraph } from '../common/MarkingParagraph';
import { BackButton } from '../common/BackButton';

export function MarkingScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pendingStart, setPendingStart] = useState<number | null>(null);

  const entry = useRequireEntry(id);
  const { ranges, setRanges } = useMarkings(id ?? '');

  if (!entry) return null;

  const onTap = (index: number) => {
    const result = handleTokenTap(ranges, pendingStart, index);
    setRanges(result.ranges);
    setPendingStart(result.pendingStart);
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <BackButton to="/" />
        <div className="topbar-title" style={{ flex: 1 }}>覚える語句を選択</div>
        <button
          onClick={() => navigate('/', { replace: true })}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 14.5, fontWeight: 600, padding: '8px 4px' }}
        >
          完了
        </button>
      </div>

      <div className="screen-body" style={{ flex: 1 }}>
        <MarkingParagraph tokens={entry.tokens} ranges={ranges} pendingStart={pendingStart} onTap={onTap} />
      </div>

      <div
        style={{
          flexShrink: 0,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '14px 20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--accent)' }}>
          {ranges.length}箇所 選択中
          {pendingStart !== null ? ' ・ 開始語をタップ済み' : ''}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          単語をタップ → もう一度別の単語をタップして範囲を確定。マーキング済みの語句は再タップで解除されます。
        </div>
      </div>
    </div>
  );
}
