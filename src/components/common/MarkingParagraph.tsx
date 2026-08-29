import { Fragment } from 'react';
import { isWordToken } from '../../lib/tokenize';
import type { MarkingRange } from '../../types';
import { WordToken } from './WordToken';

interface MarkingParagraphProps {
  tokens: string[];
  ranges: MarkingRange[];
  pendingStart: number | null;
  onTap: (index: number) => void;
}

export function MarkingParagraph({ tokens, ranges, pendingStart, onTap }: MarkingParagraphProps) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 17,
        lineHeight: 2.15,
      }}
    >
      {tokens.map((token, i) => {
        const isWord = isWordToken(token);
        const nextIsPunct = i + 1 < tokens.length && !isWordToken(tokens[i + 1]!);
        const covering = ranges.find((r) => i >= r.start && i <= r.end);
        const variant = pendingStart === i ? 'pendingStart' : covering ? 'marked' : 'normal';
        return (
          <Fragment key={i}>
            {i > 0 && isWord && ' '}
            <WordToken
              variant={variant}
              paddingLeft={isWord ? 3 : 0}
              paddingRight={isWord ? (nextIsPunct ? 0 : 3) : 0}
              onClick={isWord ? () => onTap(i) : undefined}
            >
              {token}
            </WordToken>
          </Fragment>
        );
      })}
    </div>
  );
}
