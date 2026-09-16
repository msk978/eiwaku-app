import { useState } from 'react';
import type { GlossInfo } from '../../hooks/useGlosses';
import { PencilIcon } from './icons';

interface GlossEditorProps {
  word: string;
  gloss: GlossInfo;
  onSave: (text: string) => void;
}

export function GlossEditor({ word, gloss, onSave }: GlossEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const commit = (text: string) => {
    onSave(text);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{word}</span>
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit(draft)}
          placeholder="和訳を入力"
          aria-label={`${word} の和訳`}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 14,
            color: 'var(--text)',
          }}
        />
        <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => commit(draft)}>
          保存
        </button>
        {gloss.overridden && (
          <button
            onClick={() => commit('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, padding: 4 }}
          >
            辞書に戻す
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(gloss.text ?? '');
        setEditing(true);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'none',
        border: 'none',
        padding: 0,
        textAlign: 'left',
        color: 'var(--text)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 600 }}>{word}</span>
      <span style={{ fontSize: 13.5, color: gloss.text ? 'var(--text)' : 'var(--text-muted)' }}>
        {gloss.text ?? '和訳なし(タップして入力)'}
      </span>
      {gloss.overridden && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(修正済み)</span>}
      <PencilIcon size={14} />
    </button>
  );
}
