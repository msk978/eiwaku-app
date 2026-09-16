import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useGlosses } from '../../hooks/useGlosses';
import { useMarkings } from '../../hooks/useMarkings';
import { useRequireEntry } from '../../hooks/useRequireEntry';
import { useSessions } from '../../hooks/useSessions';
import { useSettings } from '../../hooks/useSettings';
import { pickBlanks, quizCandidates } from '../../lib/quizSelection';
import { buildQuizPieces } from '../../lib/quizPieces';
import { BackButton } from '../common/BackButton';
import { GlossEditor } from '../common/GlossEditor';
import { WordToken, type WordTokenVariant } from '../common/WordToken';

export function QuizScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useAppData();
  const entry = useRequireEntry(id);
  const { ranges } = useMarkings(id ?? '');
  const { settings, quizMode, showGlossHints, setShowGlossHints } = useSettings();
  const { addSession } = useSessions(id ?? '');

  const drawBlanks = () =>
    entry ? pickBlanks(quizCandidates(entry.tokens, ranges, quizMode), entry.pinned ?? [], settings.quizRatio) : [];

  const [blanks, setBlanks] = useState(drawBlanks);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { glossFor, setGloss } = useGlosses(
    entry,
    blanks.map((r) => r.start),
  );

  useEffect(() => {
    if (entry && blanks.length === 0) {
      navigate(`/entries/${id}`, { replace: true });
    }
  }, [entry, blanks.length, id, navigate]);

  if (!entry || blanks.length === 0) return null;

  const pinned = new Set(entry.pinned ?? []);
  const pieces = buildQuizPieces(entry.tokens, blanks);
  const total = blanks.length;
  const pinnedInBlanks = blanks.filter((r) => pinned.has(r.start)).length;
  const allRevealed = revealed.size === total;

  const handleTap = (tokenIndex: number) => {
    setActiveIndex(tokenIndex);
    if (!revealed.has(tokenIndex)) {
      setRevealed((prev) => new Set(prev).add(tokenIndex));
      return;
    }
    dispatch({ type: 'TOGGLE_PIN', entryId: entry.id, index: tokenIndex });
  };

  const toggleRevealAll = () => {
    setRevealed(allRevealed ? new Set() : new Set(blanks.map((r) => r.start)));
    setActiveIndex(null);
  };

  const recordSession = () => {
    if (revealed.size > 0) addSession(total);
  };

  const handleRedraw = () => {
    recordSession();
    setBlanks(drawBlanks());
    setRevealed(new Set());
    setActiveIndex(null);
  };

  const handleFinish = () => {
    recordSession();
    navigate(`/entries/${id}`, { replace: true });
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <BackButton to={`/entries/${id}`} />
        <div className="topbar-title" style={{ fontSize: 16 }}>
          穴 {total}箇所
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--pin-text)', marginLeft: 8 }}>
            固定 {pinnedInBlanks}
          </span>
        </div>
        <button
          onClick={() => setShowGlossHints(!showGlossHints)}
          aria-pressed={showGlossHints}
          style={{
            background: showGlossHints ? 'var(--accent-soft)' : 'none',
            border: '1.5px solid ' + (showGlossHints ? 'var(--accent)' : 'var(--border)'),
            color: showGlossHints ? 'var(--accent)' : 'var(--text-muted)',
            borderRadius: 999,
            padding: '5px 12px',
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          和訳ヒント {showGlossHints ? 'ON' : 'OFF'}
        </button>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 20px 14px' }}>
        <div
          style={{
            height: '100%',
            width: `${(revealed.size / total) * 100}%`,
            background: 'var(--accent)',
            borderRadius: 2,
            transition: 'width 0.2s',
          }}
        />
      </div>

      <div className="screen-body" style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 2.2 }}>
          {pieces.map((piece, i) => {
            const leadsWithWord = piece.type === 'blank' ? true : piece.leadsWithWord;
            const space = i > 0 && leadsWithWord ? ' ' : '';
            if (piece.type === 'text') {
              return <Fragment key={i}>{space}{piece.text}</Fragment>;
            }
            const tokenIndex = blanks[piece.rangeIndex]!.start;
            const isRevealed = revealed.has(tokenIndex);
            const isPinned = pinned.has(tokenIndex);
            const variant: WordTokenVariant = isRevealed
              ? isPinned
                ? 'revealedPinned'
                : 'revealedPending'
              : isPinned
                ? 'blankPinned'
                : 'blankHidden';
            const token = (
              <WordToken variant={variant} onClick={() => handleTap(tokenIndex)}>
                {isRevealed ? piece.label : ''}
              </WordToken>
            );
            const hint = showGlossHints ? glossFor(tokenIndex).text : undefined;
            return (
              <Fragment key={i}>
                {space}
                {hint ? (
                  <ruby style={{ rubyAlign: 'center' }}>
                    {token}
                    <rt style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1 }}>{hint}</rt>
                  </ruby>
                ) : (
                  token
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          padding: '14px 18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {activeIndex !== null && revealed.has(activeIndex) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <GlossEditor
              key={activeIndex}
              word={entry.tokens[activeIndex]!}
              gloss={glossFor(activeIndex)}
              onSave={(text) => setGloss(activeIndex, text)}
            />
            <div style={{ fontSize: 12.5, color: pinned.has(activeIndex) ? 'var(--pin-text)' : 'var(--text-muted)' }}>
              {pinned.has(activeIndex)
                ? '固定中: 割合を変えても毎回穴になります(もう一度タップで解除)'
                : 'もう一度タップすると、この穴を固定できます'}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
            好きな空欄をタップして答えを表示。
            <br />
            間違えた・覚えたい穴はもう一度タップで固定。
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="secondary-btn" style={{ flex: 1, padding: '11px 6px', fontSize: 13.5 }} onClick={toggleRevealAll}>
            {allRevealed ? 'すべて隠す' : 'すべて表示'}
          </button>
          <button className="secondary-btn" style={{ flex: 1, padding: '11px 6px', fontSize: 13.5 }} onClick={handleRedraw}>
            穴を引き直す
          </button>
          <button className="primary-btn" style={{ flex: 1, padding: '11px 6px', fontSize: 13.5 }} onClick={handleFinish}>
            終了
          </button>
        </div>
      </div>
    </div>
  );
}
