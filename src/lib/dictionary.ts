export type Dictionary = Map<string, string>;

export function parseDictionary(text: string): Dictionary {
  const dict: Dictionary = new Map();
  // "IN"(Indiana) より "in" を優先するため、小文字の見出し語から登録された訳を区別する
  const fromLowercase = new Set<string>();
  for (const line of text.split('\n')) {
    const tab = line.indexOf('\t');
    if (tab <= 0) continue;
    const meaning = line.slice(tab + 1).trim();
    for (const headword of line.slice(0, tab).split(',')) {
      const trimmed = headword.trim();
      const key = trimmed.toLowerCase();
      if (!key || fromLowercase.has(key)) continue;
      if (trimmed === key) {
        dict.set(key, meaning);
        fromLowercase.add(key);
      } else if (!dict.has(key)) {
        dict.set(key, meaning);
      }
    }
  }
  return dict;
}

const MAX_GLOSS_LENGTH = 14;

/** 辞書の語義リストから、ヒントとして表示する短い訳語を1つ取り出す */
export function shortGloss(meaning: string): string {
  const cleaned = meaning.replace(/〈[^〉]*〉|《[^》]*》|\{[^}]*\}|\([^)]*\)|（[^）]*）|\[[^\]]*\]/g, '');
  const emphasized = cleaned.match(/『([^』]+)』/);
  let gloss =
    (emphasized ? emphasized[1]! : (cleaned.split(' / ')[0] ?? ''))
      .split(/[,;，；]/)
      .map((s) => s.trim())
      .find(Boolean) ?? '';
  gloss = gloss.replace(/^[…を]+|[『』]/g, '').trim();
  return gloss.length > MAX_GLOSS_LENGTH ? `${gloss.slice(0, MAX_GLOSS_LENGTH)}…` : gloss;
}

/** 活用形・複数形などから辞書の見出し語の候補を推測する(先頭ほど優先) */
export function lookupCandidates(word: string): string[] {
  const w = word.toLowerCase().replace(/’/g, "'").replace(/'s$/, '');
  const c = [w];
  const add = (s: string) => {
    if (s.length >= 2 && !c.includes(s)) c.push(s);
  };
  const doubled = (stem: string) => /([b-df-hj-np-tv-z])\1$/.test(stem);

  if (w.endsWith('ies')) add(`${w.slice(0, -3)}y`);
  if (w.endsWith('ves')) {
    add(`${w.slice(0, -3)}f`);
    add(`${w.slice(0, -3)}fe`);
  }
  if (w.endsWith('s') && !w.endsWith('ss')) add(w.slice(0, -1));
  if (w.endsWith('es')) add(w.slice(0, -2));
  if (w.endsWith('ied')) add(`${w.slice(0, -3)}y`);
  if (w.endsWith('ed')) {
    const stem = w.slice(0, -2);
    add(`${stem}e`);
    add(stem);
    if (doubled(stem)) add(stem.slice(0, -1));
  }
  if (w.endsWith('ing')) {
    const stem = w.slice(0, -3);
    add(stem);
    add(`${stem}e`);
    if (doubled(stem)) add(stem.slice(0, -1));
  }
  if (w.endsWith('ier')) add(`${w.slice(0, -3)}y`);
  if (w.endsWith('iest')) add(`${w.slice(0, -4)}y`);
  if (w.endsWith('er')) add(w.slice(0, -2));
  if (w.endsWith('est')) add(w.slice(0, -3));
  if (w.endsWith('ly')) add(w.slice(0, -2));
  return c;
}

export function dictionaryLetter(word: string): string | null {
  const first = word[0]?.toLowerCase();
  return first && first >= 'a' && first <= 'z' ? first : null;
}

export function lookupGloss(dict: Dictionary, word: string): string | undefined {
  for (const candidate of lookupCandidates(word)) {
    const meaning = dict.get(candidate);
    if (meaning) {
      const gloss = shortGloss(meaning);
      if (gloss) return gloss;
    }
  }
  return undefined;
}
