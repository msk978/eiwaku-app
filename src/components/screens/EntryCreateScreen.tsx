import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '../../hooks/useEntries';
import { BackButton } from '../common/BackButton';

export function EntryCreateScreen() {
  const navigate = useNavigate();
  const { addEntry } = useEntries();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextFile = async (file: File) => {
    setText(await file.text());
    if (!title.trim()) setTitle(file.name.replace(/.[^.]+$/, ''));
  };

  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text],
  );

  const warning =
    wordCount > 0 && wordCount < 60
      ? '推奨(100〜300語)よりだいぶ短めです'
      : wordCount > 400
        ? '推奨(100〜300語)を大きく超えています'
        : null;

  const handleSave = () => {
    if (!text.trim()) return;
    const entry = addEntry(text, title);
    navigate(`/entries/${entry.id}/mark`, { replace: true });
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <BackButton to="/" />
        <div className="topbar-title">英文を登録</div>
      </div>

      <div className="screen-body">
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>タイトル(任意)</div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: Chapter 3 dialogue"
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 14.5,
            color: 'var(--text)',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>英文(100〜300語程度)</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600, padding: 4 }}
          >
            テキストファイルから取り込む
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleTextFile(file);
              e.target.value = '';
            }}
          />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ここに英文を貼り付けてください"
          style={{
            width: '100%',
            minHeight: 320,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 16,
            fontFamily: 'var(--font-serif)',
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--text)',
            resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-muted)' }}>
          <span>{wordCount} words</span>
          <span>推奨: 100〜300 words</span>
        </div>
        {warning && (
          <div style={{ background: 'var(--accent-soft)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#33506e' }}>
            {warning}
          </div>
        )}
        <div style={{ background: 'var(--accent-soft)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#33506e', lineHeight: 1.5 }}>
          保存すると本文は編集できなくなります。誤字があれば削除して登録し直してください。保存後は穴埋めにする単語の選択に進みます(学習開始画面で「全単語からランダム」を選べば、選択なしでも学習できます)。
        </div>
        <button className="primary-btn" style={{ marginTop: 'auto' }} disabled={!text.trim()} onClick={handleSave}>
          保存してマーキングへ
        </button>
      </div>
    </div>
  );
}
