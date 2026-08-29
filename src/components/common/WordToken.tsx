import type { ReactNode } from 'react';

export type WordTokenVariant =
  | 'normal'
  | 'marked'
  | 'pendingStart'
  | 'blankHidden'
  | 'revealedPending'
  | 'revealedCorrect'
  | 'revealedIncorrect';

const VARIANT_STYLE: Record<WordTokenVariant, React.CSSProperties> = {
  normal: {},
  marked: {
    background: 'var(--accent-soft)',
    boxShadow: 'inset 0 -2px 0 var(--accent)',
    color: '#2c4560',
    borderRadius: 5,
  },
  pendingStart: {
    outline: '2px dashed var(--accent)',
    outlineOffset: 1,
    background: '#fff',
    borderRadius: 5,
  },
  blankHidden: {
    display: 'inline-block',
    minWidth: 64,
    height: 20,
    borderBottom: '2px solid var(--accent)',
    verticalAlign: 'middle',
  },
  revealedPending: {
    color: 'var(--accent)',
    fontWeight: 600,
    borderBottom: '2px solid var(--accent)',
    padding: '0 2px',
  },
  revealedCorrect: {
    color: 'var(--success)',
    fontWeight: 600,
    borderBottom: '2px solid var(--success)',
    background: 'var(--success-soft)',
    borderRadius: 5,
    padding: '1px 5px',
  },
  revealedIncorrect: {
    color: 'var(--danger)',
    fontWeight: 600,
    borderBottom: '2px solid var(--danger)',
    background: 'var(--danger-soft)',
    borderRadius: 5,
    padding: '1px 5px',
  },
};

interface WordTokenProps {
  children?: ReactNode;
  variant?: WordTokenVariant;
  onClick?: () => void;
  paddingLeft?: number;
  paddingRight?: number;
}

export function WordToken({ children, variant = 'normal', onClick, paddingLeft = 3, paddingRight = 3 }: WordTokenProps) {
  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        padding: `1px ${paddingRight}px 1px ${paddingLeft}px`,
        cursor: onClick ? 'pointer' : undefined,
        ...VARIANT_STYLE[variant],
      }}
    >
      {children}
    </span>
  );
}
