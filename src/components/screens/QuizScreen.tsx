import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMarkings } from '../../hooks/useMarkings';
import { useRequireEntry } from '../../hooks/useRequireEntry';
import { useSessions } from '../../hooks/useSessions';
import { useSettings } from '../../hooks/useSettings';
import { pickQuizRanges } from '../../lib/quizSelection';
import { buildQuizPieces } from '../../lib/quizPieces';
import { BackButton } from '../common/BackButton';
import { WordToken } from '../common/WordToken';
import { CheckIcon, XIcon } from '../common/icons';

type Phase = 'hidden' | 'revealed' | 'graded';

export function QuizScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entry = useRequireEntry(id);
  const { ranges } = useMarkings(id ?? '');
  const { settings } = useSettings();
  const { addSession } = useSessions(id ?? '');

  const [quizRanges] = useState(() => pickQuizRanges(ranges, settings.quizRatio));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('hidden');
  const [lastGradeCorrect, setLastGradeCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (entry && quizRanges.length === 0) {
      navigate(`/entries/${id}`, { replace: true });
    }
  }, [entry, quizRanges.length, id, navigate]);

  if (!entry || quizRanges.length === 0) return null;

  const pieces = buildQuizPieces(entry.tokens, quizRanges);
  const total = quizRanges.length;
  const currentBlankLabel =
    pieces.find((p): p is Extract<typeof p, { type: 'blank' }> => p.type === 'blank' && p.rangeIndex === currentIndex)
      ?.label ?? '';

  const handleReveal = (rangeIndex: number) => {
    if (rangeIndex !== currentIndex || phase !== 'hidden') return;
    setPhase('revealed');
  };

  const handleGrade = (correct: boolean) => {
    setLastGradeCorrect(correct);
    setPhase('graded');
    if (correct) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    const nextCorrect = correctCount;
    if (currentIndex === total - 1) {
      addSession(total, nextCorrect);
      navigate(`/entries/${id}/quiz/result`, {
        replace: true,
        state: { total, correct: nextCorrect },
      });
      return;
    }
    setCurrentIndex((i) => i + 1);
    setPhase('hidden');
    setLastGradeCorrect(null);
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <BackButton to={`/entries/${id}`} />
        <div className="topbar-title">設問 {currentIndex + 1} / {total}</div>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 20px 14px' }}>
        <div
          style={{
            height: '100%',
            width: `${(currentIndex / total) * 100}%`,
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
            const j = piece.rangeIndex;
            let variant: 'blankHidden' | 'revealedPending' | 'revealedCorrect' | 'revealedIncorrect' = 'blankHidden';
            let label = '';
            if (j < currentIndex) {
              variant = 'revealedPending';
              label = piece.label;
            } else if (j === currentIndex) {
              if (phase === 'hidden') {
                variant = 'blankHidden';
              } else if (phase === 'revealed') {
                variant = 'revealedPending';
                label = piece.label;
              } else {
                variant = lastGradeCorrect ? 'revealedCorrect' : 'revealedIncorrect';
                label = piece.label;
              }
            }
            return (
              <Fragment key={i}>
                {space}
                <WordToken variant={variant} onClick={j === currentIndex && phase === 'hidden' ? () => handleReveal(j) : undefined}>
                  {label}
                </WordToken>
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
          padding: '16px 18px 22px',
          minHeight: 96,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {phase === 'hidden' && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            空欄をタップすると答えが表示されます
          </div>
        )}
        {phase === 'revealed' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600 }}>{currentBlankLabel}</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleGrade(false)}
                  aria-label="不正解"
                  style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--danger)', background: 'none' }}
                >
                  <XIcon />
                </button>
                <button
                  onClick={() => handleGrade(true)}
                  aria-label="正解"
                  style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--success)', background: 'none' }}
                >
                  <CheckIcon />
                </button>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>思い出せたか自己採点してください</div>
          </>
        )}
        {phase === 'graded' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: lastGradeCorrect ? 'var(--success-soft)' : 'var(--danger-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {lastGradeCorrect ? <CheckIcon size={16} /> : <XIcon size={16} />}
              </div>
              <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                {lastGradeCorrect ? '正解として記録しました' : '不正解として記録しました'}
              </span>
            </div>
            <button className="primary-btn" onClick={handleNext}>
              {currentIndex === total - 1 ? '結果を見る' : '次の空欄へ'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
