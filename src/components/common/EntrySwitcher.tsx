import type { Entry } from '../../types';

interface EntrySwitcherProps {
  prev: Entry | null;
  next: Entry | null;
  position: number;
  total: number;
  onMove: (entry: Entry) => void;
}

const navButtonStyle = (enabled: boolean): React.CSSProperties => ({
  background: 'none',
  border: '1.5px solid var(--border)',
  borderRadius: 999,
  padding: '5px 12px',
  fontSize: 12.5,
  fontWeight: 600,
  color: enabled ? 'var(--accent)' : 'var(--text-muted)',
  opacity: enabled ? 1 : 0.45,
  whiteSpace: 'nowrap',
});

/** 前後の題材へ移動するバー。出題設定(割合・対象)は共通なのでそのまま引き継がれる */
export function EntrySwitcher({ prev, next, position, total, onMove }: EntrySwitcherProps) {
  if (total <= 1 || position < 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 20px 12px' }}>
      <button
        style={navButtonStyle(prev !== null)}
        disabled={prev === null}
        onClick={() => prev && onMove(prev)}
        aria-label="前の題材"
      >
        ‹ 前の題材
      </button>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}>
        {position + 1} / {total}
      </div>
      <button
        style={navButtonStyle(next !== null)}
        disabled={next === null}
        onClick={() => next && onMove(next)}
        aria-label="次の題材"
      >
        次の題材 ›
      </button>
    </div>
  );
}
