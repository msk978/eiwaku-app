/** 本文の改行。段落の切れ目なら、段落の間を少し空ける */
export function ParagraphBreak({ paragraph = true }: { paragraph?: boolean }) {
  return <span style={{ display: 'block', height: paragraph ? 12 : 0 }} />;
}

/** 段落の頭の通し番号(チャンク大全・Idiomatic 300) */
export function ParagraphNumber({ n }: { n: number | undefined }) {
  if (n === undefined) return null;
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans, inherit)',
        fontSize: 11.5,
        fontWeight: 600,
        color: 'var(--text-muted)',
        marginRight: 6,
        userSelect: 'none',
      }}
    >
      {n}.
    </span>
  );
}
