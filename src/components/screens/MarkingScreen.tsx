import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlosses } from '../../hooks/useGlosses';
import { useMarkings } from '../../hooks/useMarkings';
import { useRequireEntry } from '../../hooks/useRequireEntry';
import { isMarked, toggleWordMarking } from '../../lib/markingLogic';
import { expandToWordRanges } from '../../lib/quizSelection';
import { GlossEditor } from '../common/GlossEditor';
import { MarkingParagraph } from '../common/MarkingParagraph';
import { BackButton } from '../common/BackButton';

export function MarkingScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lastTapped, setLastTapped] = useState<number | null>(null);

  const entry = useRequireEntry(id);
  const { ranges, setRanges } = useMarkings(id ?? '');
  const activeIndex = lastTapped !== null && isMarked(ranges, lastTapped) ? lastTapped : null;
  const { glossFor, setGloss } = useGlosses(entry, activeIndex !== null ? [activeIndex] : []);

  if (!entry) return null;

  const markedWordCount = expandToWordRanges(entry.tokens, ranges).length;

  const onTap = (index: number) => {
    setRanges(toggleWordMarking(ranges, index));
    setLastTapped(index);
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <BackButton to="/" />
        <div className="topbar-title" style={{ flex: 1 }}>穴埋めにする単語を選択</div>
        <button
          onClick={() => navigate('/', { replace: true })}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 14.5, fontWeight: 600, padding: '8px 4px' }}
        >
          完了
        </button>
      </div>

      <div className="screen-body" style={{ flex: 1 }}>
        <MarkingParagraph tokens={entry.tokens} ranges={ranges} activeIndex={activeIndex} onTap={onTap} />
      </div>

      <div
        style={{
          flexShrink: 0,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '14px 20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--accent)' }}>{markedWordCount}語 選択中</div>
        {activeIndex !== null && (
          <GlossEditor
            key={activeIndex}
            word={entry.tokens[activeIndex]!}
            gloss={glossFor(activeIndex)}
            onSave={(text) => setGloss(activeIndex, text)}
          />
        )}
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          タップした単語が1語ずつ穴埋めの対象になります。もう一度タップすると解除されます。和訳はタップして修正できます。
        </div>
      </div>
    </div>
  );
}
